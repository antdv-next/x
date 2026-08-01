import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const distDir = path.resolve(
  process.env.DOCS_DIST_DIR ?? path.join(import.meta.dirname, "../dist"),
);
const manifestPath = path.join(distDir, ".vite/manifest.json");

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectFiles(absolutePath);
      const fileStat = await stat(absolutePath);
      const contents = await readFile(absolutePath);
      return {
        file: path.relative(distDir, absolutePath),
        bytes: fileStat.size,
        gzipBytes: gzipSync(contents).byteLength,
      };
    }),
  );
  return files.flat();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

function summarize(files) {
  return files.reduce(
    (summary, file) => ({
      count: summary.count + 1,
      bytes: summary.bytes + file.bytes,
      gzipBytes: summary.gzipBytes + file.gzipBytes,
    }),
    { count: 0, bytes: 0, gzipBytes: 0 },
  );
}

function printSummaryRow(label, summary) {
  console.log(
    `| ${label} | ${summary.count} | ${formatBytes(summary.bytes)} | ${formatBytes(summary.gzipBytes)} |`,
  );
}

const files = await collectFiles(distDir);
const filesByName = new Map(files.map(file => [file.file, file]));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const docsRoot = path.resolve(distDir, "..");

function collectStaticFiles(manifestKey, collected = new Set()) {
  if (collected.has(manifestKey)) return collected;
  collected.add(manifestKey);
  const chunk = manifest[manifestKey];
  for (const importedKey of chunk?.imports ?? []) {
    collectStaticFiles(importedKey, collected);
  }
  return collected;
}

function summarizeManifestKeys(keys) {
  const outputFiles = new Set();
  for (const key of keys) {
    const chunk = manifest[key];
    if (!chunk) continue;
    if (chunk.file) outputFiles.add(chunk.file);
    for (const file of chunk.css ?? []) outputFiles.add(file);
    for (const file of chunk.assets ?? []) outputFiles.add(file);
  }
  return summarize(
    [...outputFiles].map(file => filesByName.get(file)).filter(Boolean),
  );
}

function classifyLongTail(key, chunk) {
  const source = `${key} ${chunk.file ?? ""}`.toLowerCase();
  const outputName = path.basename(chunk.file ?? "").toLowerCase();

  if (source.includes("node_modules/@antv/infographic"))
    return "infographic runtime";
  if (
    source.includes("node_modules/mermaid/") ||
    source.includes("node_modules/@mermaid-js/")
  )
    return "mermaid runtime";
  if (outputName.startsWith("chunk-")) return "chunk-* shared";
  if (
    source.includes("locale") ||
    source.includes("defaultlocale") ||
    source.includes("uselocale")
  )
    return "locale";
  if (source.includes("infographic")) return "infographic route";
  if (source.includes("mermaid")) return "mermaid route";
  return null;
}

function formatManifestKey(key) {
  if (key.startsWith(`${docsRoot}${path.sep}`))
    return path.relative(docsRoot, key);
  return key;
}

function formatImporterSamples(importers) {
  if (!importers) return "-";
  const owners = [
    ...[...importers.static].map(key => `S:${formatManifestKey(key)}`),
    ...[...importers.dynamic].map(key => `D:${formatManifestKey(key)}`),
  ];
  const visibleOwners = owners.slice(0, 3).join("<br>");
  return owners.length > 3
    ? `${visibleOwners}<br>+${owners.length - 3} more`
    : visibleOwners;
}

const manifestImporters = new Map();
for (const [key, chunk] of Object.entries(manifest)) {
  for (const importedKey of chunk.imports ?? []) {
    const importers = manifestImporters.get(importedKey) ?? {
      static: new Set(),
      dynamic: new Set(),
    };
    importers.static.add(key);
    manifestImporters.set(importedKey, importers);
  }
  for (const importedKey of chunk.dynamicImports ?? []) {
    const importers = manifestImporters.get(importedKey) ?? {
      static: new Set(),
      dynamic: new Set(),
    };
    importers.dynamic.add(key);
    manifestImporters.set(importedKey, importers);
  }
}

const longTailGroups = new Map();
for (const [key, chunk] of Object.entries(manifest)) {
  if (!chunk.file?.endsWith(".js")) continue;
  const category = classifyLongTail(key, chunk);
  const file = filesByName.get(chunk.file);
  if (!category || !file) continue;

  const entries = longTailGroups.get(category) ?? new Map();
  if (!entries.has(chunk.file)) {
    entries.set(chunk.file, {
      key,
      file,
      importers: manifestImporters.get(key),
    });
  }
  longTailGroups.set(category, entries);
}

const jsFiles = files.filter(file => file.file.endsWith(".js"));
const cssFiles = files.filter(file => file.file.endsWith(".css"));
const jsonFiles = files.filter(file => file.file.endsWith(".json"));
const demoSourceFiles = jsonFiles.filter(file =>
  path.basename(file.file).startsWith("demo-source-"),
);
const entryChunks = Object.entries(manifest).filter(
  ([, chunk]) => chunk.isEntry,
);

console.log("# Docs Bundle Report\n");
console.log("## Totals\n");
console.log("| Asset | Files | Raw | Gzip |");
console.log("| --- | ---: | ---: | ---: |");
printSummaryRow("JavaScript", summarize(jsFiles));
printSummaryRow("CSS", summarize(cssFiles));
printSummaryRow("JSON", summarize(jsonFiles));
printSummaryRow("Demo source JSON", summarize(demoSourceFiles));

console.log("\n## Entry Static Graph\n");
console.log("| Entry | Files | Raw | Gzip |");
console.log("| --- | ---: | ---: | ---: |");
for (const [key, chunk] of entryChunks) {
  const summary = summarizeManifestKeys(collectStaticFiles(key));
  printSummaryRow(chunk.file, summary);
}

console.log("\n## Largest JavaScript Files\n");
console.log("| File | Raw | Gzip |");
console.log("| --- | ---: | ---: |");
for (const file of [...jsFiles]
  .sort((left, right) => right.bytes - left.bytes)
  .slice(0, 15)) {
  console.log(
    `| ${file.file} | ${formatBytes(file.bytes)} | ${formatBytes(file.gzipBytes)} |`,
  );
}

const dynamicEntries = Object.entries(manifest)
  .filter(([, chunk]) => chunk.isDynamicEntry)
  .map(([key, chunk]) => ({
    file: chunk.file,
    summary: summarizeManifestKeys(collectStaticFiles(key)),
  }))
  .sort((left, right) => right.summary.bytes - left.summary.bytes)
  .slice(0, 15);

console.log("\n## Largest Dynamic Entry Graphs\n");
console.log("| Entry | Files | Raw | Gzip |");
console.log("| --- | ---: | ---: | ---: |");
for (const entry of dynamicEntries) printSummaryRow(entry.file, entry.summary);

console.log("\n## Long-tail Ownership\n");
console.log("| Category | Files | Raw | Gzip |");
console.log("| --- | ---: | ---: | ---: |");
for (const [category, entries] of longTailGroups) {
  printSummaryRow(
    category,
    summarize([...entries.values()].map(entry => entry.file)),
  );
}

console.log("\n### Largest Long-tail Outputs\n");
console.log(
  "| Category | Output | Manifest owner | Raw | Gzip | Static refs | Dynamic refs | Importer samples |",
);
console.log("| --- | --- | --- | ---: | ---: | ---: | ---: | --- |");
for (const [category, entries] of longTailGroups) {
  for (const [output, entry] of [...entries]
    .sort(([, left], [, right]) => right.file.bytes - left.file.bytes)
    .slice(0, 5)) {
    console.log(
      `| ${category} | ${output} | ${formatManifestKey(entry.key)} | ${formatBytes(entry.file.bytes)} | ${formatBytes(entry.file.gzipBytes)} | ${entry.importers?.static.size ?? 0} | ${entry.importers?.dynamic.size ?? 0} | ${formatImporterSamples(entry.importers)} |`,
    );
  }
}
