import type { MarkdownItEnv } from "@mdit-vue/types";
import type { PluginOption } from "vite-plus";

import { LRUCache } from "lru-cache";
import { findStaticImports } from "mlly";
import pathe from "pathe";

import type { CreateMarkdownOptions } from "./markdown";

import { shortHash } from "../utils/shortHash";
import { useMarkdown } from "./markdown";
import { SCRIPT_REGEX, STYLE_REGEX } from "./shared";

function formatPageData(env: MarkdownItEnv) {
  const pageData = {
    title: env.title ?? "",
    frontmatter: env.frontmatter ?? {},
    headers: env.headers ?? [],
    description: "",
  };

  if (typeof env.frontmatter?.description === "string")
    pageData.description = env.frontmatter.description;

  if (typeof env.frontmatter?.title === "string" && !env.title)
    pageData.title = env.frontmatter.title;

  return pageData;
}

function checkPkgImport(findCode: string, pkg: string, importName: string) {
  if (!findCode) return false;
  const imports = findStaticImports(findCode);
  return imports.some(
    item => item.specifier === pkg && item.imports.includes(importName),
  );
}

function addScriptSetup(
  scriptTags: RegExpMatchArray | null,
  env: MarkdownItEnv,
) {
  const pageData = formatPageData(env);
  const baseCode = `const __pageData = ${JSON.stringify(pageData)};\nconst frontmatter = ${JSON.stringify(env.frontmatter ?? {})};\n`;
  const importsCode = `import { inject, provide, ref } from 'vue';\n`;
  const injectedCode = `const __parentPageData = ref({});provide('__pageData__', (data) => { __parentPageData.value = data });const __pageDataFunc__ = inject('__pageData__', null);if (__pageDataFunc__) __pageDataFunc__(__pageData);provide('__pageInfo__', __pageData);defineExpose({ frontmatter, pageData: __pageData })`;

  if (!scriptTags?.length)
    return `<script setup lang="ts">\n${importsCode}${baseCode}${injectedCode}\n</script>\n`;

  const scriptSetupCode = scriptTags.find(tag =>
    /<script\b[^>]+\bsetup\b[^>]*>/i.test(tag),
  );
  if (!scriptSetupCode)
    return `<script setup lang="ts">\n${importsCode}${baseCode}${injectedCode}\n</script>\n${scriptTags.join("\n")}\n`;

  const restScriptTags = scriptTags.filter(tag => tag !== scriptSetupCode);
  const scriptContent = scriptSetupCode
    .replace(/<script\b[^>]+\bsetup\b[^>]*>/i, "")
    .replace(/<\/script>/i, "");

  const importArr: string[] = [];
  if (!checkPkgImport(scriptContent, "vue", "provide"))
    importArr.push("provide");
  if (!checkPkgImport(scriptContent, "vue", "inject")) importArr.push("inject");
  if (!checkPkgImport(scriptContent, "vue", "ref")) importArr.push("ref");

  const nextImports = importArr.length
    ? `import { ${importArr.join(", ")} } from 'vue';\n`
    : "";
  return `<script setup lang="ts">\n${nextImports}${scriptContent}${baseCode}${injectedCode}\n</script>\n${restScriptTags.join("\n")}\n`;
}

export function md2Vue(code: string, env: MarkdownItEnv) {
  code = code.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, match =>
    match.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;"),
  );

  const scriptTags = code.match(SCRIPT_REGEX);
  const styleTags = code.match(STYLE_REGEX);
  const templateCode = code.replace(SCRIPT_REGEX, "").replace(STYLE_REGEX, "");
  const vueComponent = `<template>\n<div class="ant-doc vp-doc">${templateCode}</div>\n</template>\n`;
  return `${addScriptSetup(scriptTags, env)}\n${vueComponent}\n${styleTags?.join("\n") || ""}`;
}

export function md2VuePlugin(
  options: CreateMarkdownOptions = {},
): PluginOption {
  let md: ReturnType<typeof useMarkdown>;
  const cache = new LRUCache<string, { hash: string; code: string }>({
    max: 500,
    ttl: 1000 * 60 * 10,
    allowStale: true,
    updateAgeOnGet: true,
  });

  async function transform(code: string, id: string) {
    const hash = shortHash(code);
    const cached = cache.get(id);
    if (cached && cached.hash === hash) return cached.code;

    const env: MarkdownItEnv = { id };
    const html = await md.renderAsync(code, env);
    const vueCode = md2Vue(html, env);
    cache.set(id, { hash, code: vueCode });
    return vueCode;
  }

  function shouldSkipTransform(id: string) {
    if (id.includes("?vue")) return true;

    const query = id.split("?")[1];
    if (!query) return false;
    const params = new URLSearchParams(query);
    return params.has("raw") || params.has("url");
  }

  return {
    enforce: "pre",
    name: "vite:md2vue",
    configResolved(config) {
      md = useMarkdown({
        root: pathe.resolve(config.root ?? process.cwd(), "."),
        ...options,
      });
    },
    transform: {
      filter: { id: /\.md($|\?)/ },
      async handler(code, id) {
        if (shouldSkipTransform(id)) return null;
        return transform(code, id);
      },
    },
    handleHotUpdate(ctx) {
      if (!ctx.file.endsWith(".md")) return;

      const defaultRead = ctx.read;
      ctx.read = async () => transform(await defaultRead(), ctx.file);
    },
  };
}
