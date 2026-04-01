import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "tinyglobby";

const DEFAULT_LOCALE = "zh-CN";
const SITE_URL = process.env.LLM_SITE_URL?.replace(/\/$/, "") || "";

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function unquote(value) {
  if (!value) return "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/m, "").trim();
}

function extractTitle(content) {
  const frontmatter = content.match(/^---[\s\S]*?---/m)?.[0] || "";
  const frontTitle = frontmatter.match(/^\s*title\s*:\s*(.+)$/m)?.[1]?.trim();
  if (frontTitle) return unquote(frontTitle);

  const body = stripFrontmatter(content);
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading ? unquote(heading) : "";
}

function toOutputRelativePath(relativePath, locale) {
  const basePath = relativePath.replace(/\.(en-US|zh-CN)\.md$/, "");
  const segments = basePath.split("/").filter(Boolean);

  if (segments.at(-1) === "index") segments.pop();

  let routePath = `/${segments.join("/")}`.replace(/\/+/g, "/");
  if (routePath === "") routePath = "/";

  if (locale !== DEFAULT_LOCALE) {
    routePath = routePath === "/" ? "/en" : `${routePath}-en`;
  }

  if (routePath === "/") return "index.md";
  return `${routePath.slice(1)}.md`;
}

function toMarkdownUrl(outputRelativePath) {
  const urlPath = `/${normalizePath(outputRelativePath)}`;
  return SITE_URL ? `${SITE_URL}${urlPath}` : urlPath;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractDemoEntries(content) {
  const entries = [];
  const demoRegex = /<demo\b([^>]*)>([\s\S]*?)<\/demo>/g;

  for (const match of content.matchAll(demoRegex)) {
    const attrs = match[1] || "";
    const srcMatch = attrs.match(
      /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/,
    );
    const src = srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3];
    if (!src) continue;

    const rawTitle = (match[2] || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const fallbackTitle = path
      .basename(src, path.extname(src))
      .replace(/[-_]/g, " ");

    entries.push({
      full: match[0],
      src,
      title: rawTitle || fallbackTitle,
      start: match.index || 0,
      end: (match.index || 0) + match[0].length,
    });
  }

  return entries;
}

function extractLastHeadingLevel(markdown) {
  const headingRegex = /^#{1,6}\s+/gm;
  let level = 2;
  for (const hit of markdown.matchAll(headingRegex))
    level = hit[0].trim().length;
  return level;
}

function extractDemoDescription(source, locale) {
  const localePattern = new RegExp(
    `<docs\\s+lang=["']${escapeRegExp(locale)}["']\\s*>([\\s\\S]*?)<\\/docs>`,
    "i",
  );

  const localeMatch = source.match(localePattern);
  const fallbackMatch = source.match(/<docs\b[^>]*>([\s\S]*?)<\/docs>/i);
  const raw = localeMatch?.[1] || fallbackMatch?.[1] || "";
  return raw.replace(/\r/g, "").trim();
}

function stripDemoDocsBlocks(source) {
  return source.replace(/<docs\b[^>]*>[\s\S]*?<\/docs>\s*/gi, "").trim();
}

function getTopSection(relativePath) {
  const first = normalizePath(relativePath).split("/")[0] || "misc";
  return first;
}

function buildStandalonePage(title, content) {
  return [`# ${title}`, "", content, ""].join("\n");
}

async function readSemanticFile(outputDir, fileName) {
  try {
    return (await fs.readFile(path.join(outputDir, fileName), "utf-8")).trim();
  } catch {
    return "";
  }
}

async function collectDocsByLocale(pagesDir, locale) {
  const pattern = `**/*.${locale}.md`;
  const files = await glob(pattern, { cwd: pagesDir, absolute: true });

  const items = [];

  for (const file of files) {
    const fullPath = path.resolve(file);
    const content = (await fs.readFile(fullPath, "utf-8")).trim();
    const title = extractTitle(content);

    if (!title) {
      // eslint-disable-next-line no-console
      console.log("[llms] Missing title, skipped:", fullPath);
      continue;
    }

    const relativePath = normalizePath(path.relative(pagesDir, fullPath));
    const outputRelativePath = toOutputRelativePath(relativePath, locale);
    const url = toMarkdownUrl(outputRelativePath);

    const body = stripFrontmatter(content);
    const demos = extractDemoEntries(body);

    let merged = "";
    let cursor = 0;

    for (const demo of demos) {
      merged += body.slice(cursor, demo.start);

      const before = body.slice(0, demo.start);
      const headingPrefix = "#".repeat(
        Math.min(extractLastHeadingLevel(before) + 1, 6),
      );
      const demoPath = path.resolve(path.dirname(fullPath), demo.src);

      try {
        const demoSource = await fs.readFile(demoPath, "utf-8");
        const description = extractDemoDescription(demoSource, locale);
        const code = stripDemoDocsBlocks(demoSource);
        const lang = path.extname(demo.src).slice(1) || "vue";

        const block = [
          `${headingPrefix} ${demo.title}`,
          "",
          description,
          "",
          `\`\`\`${lang}`,
          code,
          "```",
          "",
        ]
          .filter(Boolean)
          .join("\n");

        merged += block;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        merged += [
          `${headingPrefix} ${demo.title}`,
          "",
          `Demo source not found: \`${normalizePath(path.relative(path.dirname(fullPath), demoPath))}\``,
          "",
          `> ${message}`,
          "",
        ].join("\n");
      }

      cursor = demo.end;
    }

    merged += body.slice(cursor);

    const fullContent = [
      "---",
      `Title: ${title}`,
      `URL: ${url}`,
      "---",
      "",
      merged.trim(),
      "",
    ].join("\n");

    items.push({
      title,
      locale,
      url,
      section: getTopSection(relativePath),
      outputRelativePath,
      content: fullContent,
      pageContent: buildStandalonePage(title, merged.trim()),
    });
  }

  items.sort((a, b) => a.title.localeCompare(b.title));
  return items;
}

function groupBySection(items) {
  const map = new Map();
  for (const item of items) {
    const list = map.get(item.section) || [];
    list.push(item);
    map.set(item.section, list);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function renderLocaleSection(title, items) {
  const groups = groupBySection(items);
  const lines = [title, ""];

  for (const [section, docs] of groups) {
    lines.push(`### ${section}`);
    lines.push("");
    docs.forEach(doc => lines.push(`- [${doc.title}](${doc.url})`));
    lines.push("");
  }

  return lines.join("\n");
}

async function generateLlms() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(currentDir, "../../../../");
  const docsDir = path.resolve(repoRoot, "packages/docs");
  const pagesDir = path.join(docsDir, "src/pages");

  const outputDir = process.env.LLM_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.LLM_OUTPUT_DIR)
    : path.join(docsDir, "public");

  await fs.mkdir(outputDir, { recursive: true });

  const [enItems, cnItems, semanticEn, semanticCn] = await Promise.all([
    collectDocsByLocale(pagesDir, "en-US"),
    collectDocsByLocale(pagesDir, "zh-CN"),
    readSemanticFile(outputDir, "llms-semantic.md"),
    readSemanticFile(outputDir, "llms-semantic-cn.md"),
  ]);

  const allItems = [...enItems, ...cnItems];

  const navContent = [
    "# Antdv Next X - LLM Documentation Index",
    "",
    "- AI-optimized index for Antdv Next X docs and component guides.",
    "",
    "## Navigation",
    "",
    "- [Full Documentation (EN)](./llms-full.txt)",
    "- [Full Documentation (CN)](./llms-full-cn.txt)",
    "- [Semantic Documentation (EN)](./llms-semantic.md)",
    "- [Semantic Documentation (CN)](./llms-semantic-cn.md)",
    "",
    renderLocaleSection("## Docs (EN)", enItems),
    "",
    renderLocaleSection("## Docs (CN)", cnItems),
    "",
  ].join("\n");

  const fullEn = [
    "---",
    "Title: Antdv Next X Documentation (EN)",
    `URL: ${toMarkdownUrl("llms-full.txt")}`,
    "---",
    "",
    semanticEn,
    "",
    ...enItems.map(item => item.content),
  ].join("\n");

  const fullCn = [
    "---",
    "Title: Antdv Next X 文档（中文）",
    `URL: ${toMarkdownUrl("llms-full-cn.txt")}`,
    "---",
    "",
    semanticCn,
    "",
    ...cnItems.map(item => item.content),
  ].join("\n");

  await Promise.all([
    fs.writeFile(path.join(outputDir, "llms.txt"), navContent),
    fs.writeFile(path.join(outputDir, "llms-full.txt"), fullEn),
    fs.writeFile(path.join(outputDir, "llms-full-cn.txt"), fullCn),
    ...allItems.map(async item => {
      const target = path.join(outputDir, item.outputRelativePath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, item.pageContent);
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `[llms] Generated files in ${outputDir} (${allItems.length} pages)`,
  );
}

generateLlms().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
