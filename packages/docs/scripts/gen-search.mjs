import { frontmatterPlugin } from "@mdit-vue/plugin-frontmatter";
import { headersPlugin } from "@mdit-vue/plugin-headers";
import { titlePlugin } from "@mdit-vue/plugin-title";
import { slugify } from "@mdit-vue/shared";
import { Charset, Document } from "flexsearch";
import MarkdownIt from "markdown-it";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "tinyglobby";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const playgroundRoot = path.resolve(__dirname, "..");
const pagesRoot = path.resolve(playgroundRoot, "src/pages");
const publicRoot = path.resolve(playgroundRoot, "public");

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
});
md.use(frontmatterPlugin);
md.use(headersPlugin, {
  level: [2, 3, 4, 5, 6],
  slugify,
});
md.use(titlePlugin);

function normalizePath(value) {
  return value.split(path.sep).join(path.posix.sep);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripAnchorMarks(value) {
  return value.replace(/\{#[^}]+\}/g, "");
}

function cleanText(value) {
  return normalizeWhitespace(stripAnchorMarks(value));
}

function stripHtml(value) {
  if (!value) return "";
  if (/<\s*(script|style|template)[\s>]/i.test(value)) return "";
  return cleanText(
    value.replace(/<[^>]*>/g, " ").replace(/&[a-z]+;|&#\d+;/gi, " "),
  );
}

function extractText(tokens) {
  const parts = [];
  const skipTypes = new Set(["fence", "code_block", "front_matter"]);
  for (const token of tokens) {
    if (skipTypes.has(token.type)) continue;

    if (token.type === "html_block" || token.type === "html_inline") {
      const text = stripHtml(token.content);
      if (text) parts.push(text);
      continue;
    }

    if (token.type === "inline") {
      if (token.children && token.children.length) {
        for (const child of token.children) {
          if (
            child.type === "text" ||
            child.type === "code_inline" ||
            child.type === "emoji"
          ) {
            if (child.content) parts.push(cleanText(child.content));
            continue;
          }
          if (child.type === "image") {
            if (child.content) parts.push(cleanText(child.content));
            continue;
          }
          if (child.type === "html_inline") {
            const text = stripHtml(child.content);
            if (text) parts.push(text);
          }
        }
      } else if (token.content) {
        parts.push(cleanText(token.content));
      }
      continue;
    }

    if (token.content) parts.push(cleanText(token.content));
  }
  return normalizeWhitespace(parts.join(" "));
}

function flattenHeaders(headers = []) {
  const result = [];
  for (const header of headers) {
    if (header?.title) result.push(header.title);
    if (header.children?.length)
      result.push(...flattenHeaders(header.children));
  }
  return result;
}

function flattenHeadersMeta(headers = []) {
  const result = [];
  for (const header of headers) {
    if (header?.title) {
      result.push({
        title: header.title,
        slug: header.slug,
        level: header.level,
      });
    }
    if (header.children?.length)
      result.push(...flattenHeadersMeta(header.children));
  }
  return result;
}

function getHeadingLevel(tag) {
  if (!tag || tag[0] !== "h") return null;
  const level = Number(tag.slice(1));
  return Number.isFinite(level) ? level : null;
}

function extractSections(tokens, headers = []) {
  const headerQueue = flattenHeadersMeta(headers);
  const headingTokens = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const level = getHeadingLevel(token.tag || "");
    if (level !== 2 && level !== 3) continue;
    const inlineToken = tokens[i + 1];
    const title =
      inlineToken?.type === "inline" ? cleanText(inlineToken.content) : "";
    if (!title) continue;
    const matchIndex = headerQueue.findIndex(
      item => item.title === title && item.level === level,
    );
    const matched =
      matchIndex >= 0 ? headerQueue.splice(matchIndex, 1)[0] : null;
    const slug = matched?.slug ?? slugify(title);
    headingTokens.push({
      index: i,
      level,
      title,
      slug,
    });
  }

  const sections = [];
  for (let i = 0; i < headingTokens.length; i += 1) {
    const current = headingTokens[i];
    let endIndex = tokens.length;
    for (let j = i + 1; j < headingTokens.length; j += 1) {
      const next = headingTokens[j];
      if (next.level <= current.level) {
        endIndex = next.index;
        break;
      }
    }
    let startIndex = current.index + 1;
    if (tokens[startIndex]?.type === "inline") startIndex += 1;
    if (tokens[startIndex]?.type === "heading_close") startIndex += 1;
    const sectionTokens = tokens.slice(startIndex, endIndex);
    const sectionText = extractText(sectionTokens);
    let snippet = "";
    for (const token of sectionTokens) {
      if (token.type === "inline") {
        snippet = extractText([token]);
        if (snippet) break;
      }
      if (token.type === "html_block") {
        snippet = stripHtml(token.content);
        if (snippet) break;
      }
    }
    const description = makeExcerpt(snippet || sectionText, 160);

    sections.push({
      title: current.title,
      slug: current.slug,
      level: current.level,
      description,
      content: sectionText,
    });
  }
  return sections;
}

function resolveRoutePath(filePath, locale) {
  const relative = normalizePath(path.relative(pagesRoot, filePath));
  let routePath = relative.startsWith("/") ? relative : `/${relative}`;

  routePath = routePath.replace(`.${locale}.md`, "");

  if (routePath.endsWith("/index")) routePath = routePath.slice(0, -6);

  if (routePath === "") routePath = "/";

  if (locale === "en-US")
    routePath = routePath === "/" ? "/-en" : `${routePath}-en`;

  return routePath;
}

function inferTitle(filePath, fallback) {
  if (fallback) return fallback;
  const base = path.basename(filePath).replace(/\.(en-US|zh-CN)\.md$/, "");
  return base;
}

function makeExcerpt(value, length) {
  if (!value) return "";
  const cleaned = cleanText(value);
  if (cleaned.length <= length) return cleaned;
  return `${cleaned.slice(0, length).trim()}...`;
}

function parseMarkdown(content) {
  const env = {};
  const tokens = md.parse(content, env);
  const frontmatter = env.frontmatter ?? {};
  const titleFromFrontmatter =
    typeof frontmatter.title === "string" ? cleanText(frontmatter.title) : "";
  const titleFromEnv =
    typeof env.title === "string" ? cleanText(env.title) : "";
  const headers = flattenHeaders(env.headers);
  const bodyText = extractText(tokens);
  const sections = extractSections(tokens, env.headers);

  const descriptionFromFrontmatter =
    typeof frontmatter.description === "string"
      ? cleanText(frontmatter.description)
      : "";

  const extraTextParts = [
    typeof frontmatter.subtitle === "string" ? frontmatter.subtitle : "",
    descriptionFromFrontmatter,
    typeof frontmatter.tag === "string" ? frontmatter.tag : "",
  ].filter(Boolean);

  const contentText = normalizeWhitespace(
    [bodyText, ...extraTextParts].filter(Boolean).join(" "),
  );

  return {
    title: titleFromFrontmatter || titleFromEnv,
    headers,
    description: descriptionFromFrontmatter || makeExcerpt(bodyText, 160),
    content: contentText,
    sections,
  };
}

function buildIndex(docs, locale) {
  const index = new Document({
    tokenize: locale === "zh-CN" ? "full" : "forward",
    encoder: locale === "zh-CN" ? Charset.CJK : Charset.Default,
    cache: 100,
    document: {
      id: "id",
      index: ["title", "content", "headers"],
      store: ["title", "description", "path", "headers", "section"],
    },
  });

  for (const doc of docs) index.add(doc);

  const exported = {};
  index.export((key, data) => {
    exported[key] = data;
  });
  return exported;
}

async function loadDocs(locale) {
  const pattern = locale === "en-US" ? "**/*.en-US.md" : "**/*.zh-CN.md";
  const files = await glob(pattern, {
    cwd: pagesRoot,
    absolute: true,
    onlyFiles: true,
  });

  files.sort((a, b) => a.localeCompare(b));

  const docs = [];
  const seen = new Set();

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    const parsed = parseMarkdown(content);
    const routePath = resolveRoutePath(filePath, locale);
    const title = inferTitle(filePath, parsed.title);
    const section = routePath.split("/")[1] ?? "";
    const id = routePath;

    const uniqueId = seen.has(id) ? `${id}__${docs.length + 1}` : id;
    if (uniqueId !== id)
      console.warn(
        `[gen-search] Duplicate route id "${id}", using "${uniqueId}" instead.`,
      );
    seen.add(uniqueId);

    docs.push({
      id: uniqueId,
      title,
      description: parsed.description,
      content: parsed.content,
      headers: parsed.headers,
      path: routePath,
      section,
    });

    for (const sectionItem of parsed.sections) {
      const sectionId = `${routePath}#${sectionItem.slug}`;
      const sectionTitle = title
        ? `${title} - ${sectionItem.title}`
        : sectionItem.title;
      const sectionDescription = sectionItem.description || parsed.description;
      const uniqueSectionId = seen.has(sectionId)
        ? `${sectionId}__${docs.length + 1}`
        : sectionId;
      if (uniqueSectionId !== sectionId) {
        console.warn(
          `[gen-search] Duplicate route id "${sectionId}", using "${uniqueSectionId}" instead.`,
        );
      }
      seen.add(uniqueSectionId);

      docs.push({
        id: uniqueSectionId,
        title: sectionTitle,
        description: sectionDescription,
        content: sectionItem.content || sectionDescription,
        headers: [sectionItem.title],
        path: sectionId,
        section,
      });
    }
  }
  return docs;
}

async function writeIndex(locale, docs) {
  const index = buildIndex(docs, locale);
  const output = {
    meta: {
      locale,
      count: docs.length,
      generatedAt: new Date().toISOString(),
    },
    index,
  };

  await mkdir(publicRoot, { recursive: true });
  const fileName = locale === "en-US" ? "search.en.json" : "search.cn.json";
  const outputPath = path.resolve(publicRoot, fileName);
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(
    `[gen-search] Wrote ${docs.length} docs to ${normalizePath(outputPath)}`,
  );
}

async function main() {
  const [enDocs, cnDocs] = await Promise.all([
    loadDocs("en-US"),
    loadDocs("zh-CN"),
  ]);
  await Promise.all([writeIndex("en-US", enDocs), writeIndex("zh-CN", cnDocs)]);
}

main().catch(error => {
  console.error("[gen-search] Failed to generate search index");
  console.error(error);
  process.exitCode = 1;
});
