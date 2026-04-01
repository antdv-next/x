import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "tinyglobby";

const SITE_URL = process.env.LLM_SITE_URL?.replace(/\/$/, "") || "";

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function toMarkdownUrl(relativePath) {
  const urlPath = `/${normalizePath(relativePath)}`;
  return SITE_URL ? `${SITE_URL}${urlPath}` : urlPath;
}

function toNestedStructure(flatMap) {
  const nested = {};

  Object.entries(flatMap).forEach(([semanticKey, description]) => {
    const parts = semanticKey.split(".").filter(Boolean);
    if (!parts.length) return;

    let current = nested;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!current[part] || typeof current[part] === "string")
        current[part] = {};
      current = current[part];
    }

    current[parts[parts.length - 1]] = description;
  });

  return nested;
}

function renderNestedList(obj, indent = 0) {
  return Object.entries(obj)
    .map(([key, value]) => {
      const pad = "  ".repeat(indent);
      if (typeof value === "string") return `${pad}- \`${key}\`: ${value}`;
      return `${pad}- \`${key}\`:\n${renderNestedList(value, indent + 1)}`;
    })
    .join("\n");
}

function parseSimpleObjectBlock(block) {
  const map = {};
  const pairRegex = /([A-Za-z0-9_$.-]+)\s*:\s*["'`]([^"'`]+)["'`]/g;

  for (const match of block.matchAll(pairRegex)) {
    const key = match[1];
    const value = match[2];
    map[key] = value;
  }

  return map;
}

function extractLocaleMaps(source) {
  const zh = {};
  const en = {};

  const zhEnPattern =
    /["']zh-CN["']\s*:\s*\{([\s\S]*?)\}\s*,\s*["']en-US["']\s*:\s*\{([\s\S]*?)\}/g;
  const enZhPattern =
    /["']en-US["']\s*:\s*\{([\s\S]*?)\}\s*,\s*["']zh-CN["']\s*:\s*\{([\s\S]*?)\}/g;

  for (const match of source.matchAll(zhEnPattern)) {
    Object.assign(zh, parseSimpleObjectBlock(match[1] || ""));
    Object.assign(en, parseSimpleObjectBlock(match[2] || ""));
  }

  for (const match of source.matchAll(enZhPattern)) {
    Object.assign(en, parseSimpleObjectBlock(match[1] || ""));
    Object.assign(zh, parseSimpleObjectBlock(match[2] || ""));
  }

  return { zh, en };
}

function extractComponentNames(source, fallbackName) {
  const names = new Set();
  const regex =
    /<SemanticPreview\b[^>]*\bcomponent-name\s*=\s*["']([^"']+)["']/g;

  for (const match of source.matchAll(regex)) {
    if (match[1]) names.add(match[1]);
  }

  if (!names.size) names.add(fallbackName);
  return [...names];
}

function extractSemanticEntries(source) {
  const entries = [];
  const pairRegex =
    /\{\s*name\s*:\s*["'`]([^"'`]+)["'`]\s*,\s*desc\s*:\s*([^\n,}]+)(?:,|\s*\})/g;

  for (const match of source.matchAll(pairRegex)) {
    const name = match[1]?.trim();
    const rawDesc = match[2]?.trim();
    if (!name || !rawDesc) continue;

    const localeKeyMatch = rawDesc.match(
      /\b[A-Za-z_$][A-Za-z0-9_$]*(?:\.value)?\.([A-Za-z0-9_$]+)\b/,
    );
    const stringMatch = rawDesc.match(/^["'`]([^"'`]+)["'`]$/);

    entries.push({
      name,
      localeKey: localeKeyMatch?.[1] || null,
      text: stringMatch?.[1] || null,
    });
  }

  return entries;
}

function mergeSemanticMap(target, source) {
  Object.entries(source).forEach(([key, value]) => {
    if (!target[key]) target[key] = value;
  });
}

function renderSemanticMarkdown(semanticMap, { title, intro, url }) {
  const components = Object.keys(semanticMap).sort((a, b) =>
    a.localeCompare(b),
  );

  const lines = [
    title,
    "",
    intro,
    "",
    `> Total ${components.length} components`,
    "",
    `> URL: ${url}`,
    "",
    "## Component List",
    "",
  ];

  components.forEach(name => {
    lines.push(`### ${name}`);
    lines.push("");
    lines.push(renderNestedList(semanticMap[name]));
    lines.push("");
  });

  return lines.join("\n");
}

async function generateSemantic() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(currentDir, "../../../../");
  const docsDir = path.resolve(repoRoot, "packages/docs");
  const componentsDir = path.join(docsDir, "src/pages/components");

  const outputDir = process.env.LLM_OUTPUT_DIR
    ? path.resolve(repoRoot, process.env.LLM_OUTPUT_DIR)
    : path.join(docsDir, "public");

  await fs.mkdir(outputDir, { recursive: true });

  const files = await glob("**/demo/*semantic*.vue", {
    cwd: componentsDir,
    absolute: true,
  });

  const semanticEn = {};
  const semanticZh = {};

  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf-8");
    const relative = normalizePath(path.relative(componentsDir, filePath));
    const fallbackName = path.basename(path.dirname(path.dirname(filePath)));

    const names = extractComponentNames(source, fallbackName);
    const localeMap = extractLocaleMaps(source);
    const entries = extractSemanticEntries(source);

    if (!entries.length) continue;

    const enFlat = {};
    const zhFlat = {};

    entries.forEach(entry => {
      if (entry.text) {
        enFlat[entry.name] = entry.text;
        zhFlat[entry.name] = entry.text;
        return;
      }

      if (!entry.localeKey) return;

      const enText = localeMap.en[entry.localeKey];
      const zhText = localeMap.zh[entry.localeKey];

      if (enText) enFlat[entry.name] = enText;
      if (zhText) zhFlat[entry.name] = zhText;
    });

    if (!Object.keys(enFlat).length && !Object.keys(zhFlat).length) {
      // eslint-disable-next-line no-console
      console.log(`[llms-semantic] Skip (no locale mappings): ${relative}`);
      continue;
    }

    names.forEach(name => {
      if (Object.keys(enFlat).length) {
        const current = semanticEn[name] || {};
        mergeSemanticMap(current, enFlat);
        semanticEn[name] = current;
      }

      if (Object.keys(zhFlat).length) {
        const current = semanticZh[name] || {};
        mergeSemanticMap(current, zhFlat);
        semanticZh[name] = current;
      }
    });
  }

  const enNested = Object.fromEntries(
    Object.entries(semanticEn).map(([name, flat]) => [
      name,
      toNestedStructure(flat),
    ]),
  );
  const zhNested = Object.fromEntries(
    Object.entries(semanticZh).map(([name, flat]) => [
      name,
      toNestedStructure(flat),
    ]),
  );

  const enContent = renderSemanticMarkdown(enNested, {
    title: "# Antdv Next X Component Semantic Descriptions",
    intro: "Semantic DOM descriptions extracted from docs demos.",
    url: toMarkdownUrl("llms-semantic.md"),
  });

  const zhContent = renderSemanticMarkdown(zhNested, {
    title: "# Antdv Next X 组件语义化描述",
    intro: "从文档示例中提取的语义化 DOM 描述。",
    url: toMarkdownUrl("llms-semantic-cn.md"),
  });

  await Promise.all([
    fs.writeFile(path.join(outputDir, "llms-semantic.md"), enContent),
    fs.writeFile(path.join(outputDir, "llms-semantic-cn.md"), zhContent),
  ]);

  // eslint-disable-next-line no-console
  console.log(`[llms-semantic] Generated files in ${outputDir}`);
}

generateSemantic().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
