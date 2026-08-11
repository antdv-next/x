// Measures the published payload of every library package: for each entry in
// package.json `files`, walk it and sum raw + gzip bytes. Mirrors the approach
// already used by packages/docs/scripts/analyze-build.mjs.
//
//   node scripts/size-report.mjs                       # markdown table
//   node scripts/size-report.mjs --json size.json      # machine-readable
//   node scripts/size-report.mjs --base base.json      # add delta columns
//
// Reporting only — it never exits non-zero on growth. Read the delta, decide
// whether the growth is earned.

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

const PACKAGES = [
  "packages/x",
  "packages/x-markdown",
  "packages/x-sdk",
  "packages/x-card",
];

// Growth below this is build-tool noise, not a real regression.
const NOISE_FLOOR_BYTES = 512;

const repoRoot = path.resolve(import.meta.dirname, "..");

/** @returns {{ json: string | null, base: string | null }} */
function parseArgs(argv) {
  /** @type {{ json: string | null, base: string | null }} */
  const args = { json: null, base: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--json") args.json = argv[++i];
    else if (argv[i] === "--base") args.base = argv[++i];
  }
  return args;
}

async function pathKind(target) {
  try {
    return (await stat(target)).isDirectory() ? "dir" : "file";
  } catch {
    return "missing";
  }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(entry => {
      const absolute = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(absolute) : [absolute];
    }),
  );
  return nested.flat();
}

async function measure(file) {
  const contents = await readFile(file);
  return {
    file: path.relative(repoRoot, file),
    bytes: contents.byteLength,
    gzipBytes: gzipSync(contents).byteLength,
  };
}

async function measurePackage(packageDir) {
  const absoluteDir = path.join(repoRoot, packageDir);
  const manifest = JSON.parse(
    await readFile(path.join(absoluteDir, "package.json"), "utf8"),
  );

  const targets = [];
  const missing = [];
  for (const entry of manifest.files ?? []) {
    const absolute = path.join(absoluteDir, entry);
    const kind = await pathKind(absolute);
    // A missing entry means the package was not built — surface it rather
    // than silently reporting a smaller payload.
    if (kind === "missing") missing.push(entry);
    else if (kind === "dir") targets.push(...(await walk(absolute)));
    else targets.push(absolute);
  }

  const files = await Promise.all(targets.map(measure));
  return {
    name: manifest.name,
    missing,
    fileCount: files.length,
    bytes: files.reduce((total, file) => total + file.bytes, 0),
    gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

function formatDelta(current, previous) {
  if (previous === undefined) return "new";
  const diff = current - previous;
  if (Math.abs(diff) < NOISE_FLOOR_BYTES) return "–";
  const percent = previous === 0 ? 100 : (diff / previous) * 100;
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${formatBytes(Math.abs(diff))} (${sign}${Math.abs(percent).toFixed(1)}%)`;
}

const args = parseArgs(process.argv.slice(2));
const report = await Promise.all(PACKAGES.map(measurePackage));

let baseline = null;
if (args.base) {
  try {
    const parsed = JSON.parse(await readFile(args.base, "utf8"));
    baseline = new Map(parsed.map(entry => [entry.name, entry]));
  } catch {
    console.error(`Baseline ${args.base} unreadable; reporting sizes only.`);
  }
}

const header = baseline
  ? "| Package | Files | Raw | Gzip | Gzip Δ |"
  : "| Package | Files | Raw | Gzip |";
const divider = baseline
  ? "| --- | ---: | ---: | ---: | ---: |"
  : "| --- | ---: | ---: | ---: |";

const lines = [header, divider];
for (const entry of report) {
  const cells = [
    `\`${entry.name}\``,
    String(entry.fileCount),
    formatBytes(entry.bytes),
    formatBytes(entry.gzipBytes),
  ];
  if (baseline) {
    cells.push(
      formatDelta(entry.gzipBytes, baseline.get(entry.name)?.gzipBytes),
    );
  }
  lines.push(`| ${cells.join(" | ")} |`);
}

const totals = report.reduce(
  (sum, entry) => ({
    fileCount: sum.fileCount + entry.fileCount,
    bytes: sum.bytes + entry.bytes,
    gzipBytes: sum.gzipBytes + entry.gzipBytes,
  }),
  { fileCount: 0, bytes: 0, gzipBytes: 0 },
);
const totalCells = [
  "**Total**",
  `**${totals.fileCount}**`,
  `**${formatBytes(totals.bytes)}**`,
  `**${formatBytes(totals.gzipBytes)}**`,
];
if (baseline) {
  const baseTotal = [...baseline.values()].reduce(
    (sum, entry) => sum + entry.gzipBytes,
    0,
  );
  totalCells.push(`**${formatDelta(totals.gzipBytes, baseTotal)}**`);
}
lines.push(`| ${totalCells.join(" | ")} |`);

const unbuilt = report.filter(entry => entry.missing.length > 0);
if (unbuilt.length > 0) {
  lines.push("");
  for (const entry of unbuilt) {
    lines.push(
      `> ⚠️ \`${entry.name}\` is missing published paths (not built?): ${entry.missing.join(", ")}`,
    );
  }
}

console.log(lines.join("\n"));

if (args.json) {
  await writeFile(args.json, `${JSON.stringify(report, null, 2)}\n`);
}
