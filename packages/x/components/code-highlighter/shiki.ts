import type { LanguageInput } from "shiki";

import type { CodeHighlighterInstance } from "./shiki-runtime";

export type CodeHighlighterLanguageLoader = (
  lang: string,
) => Promise<LanguageInput | null>;

export interface SetupCodeHighlighterOptions {
  loadLanguage?: CodeHighlighterLanguageLoader;
}

const PLAIN_TEXT_LANGUAGES = new Set(["text", "plaintext", "txt", "plain"]);

/**
 * 内置热门语言白名单。
 * 使用静态 import 路径，打包时仅生成这几个语言对应的 chunk。
 */
const BUILTIN_LANGUAGES: Record<
  string,
  () => Promise<{ default: LanguageInput }>
> = {
  typescript: () => import("shiki/dist/langs/typescript.mjs"),
  javascript: () => import("shiki/dist/langs/javascript.mjs"),
  python: () => import("shiki/dist/langs/python.mjs"),
  json: () => import("shiki/dist/langs/json.mjs"),
  html: () => import("shiki/dist/langs/html.mjs"),
  css: () => import("shiki/dist/langs/css.mjs"),
};

/** 常用别名 -> 基础语言 */
const BUILTIN_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
};

const defaultLoader: CodeHighlighterLanguageLoader = async lang => {
  const loader = BUILTIN_LANGUAGES[BUILTIN_ALIASES[lang] ?? lang];
  return loader ? (await loader()).default : null;
};

let customLoader: CodeHighlighterLanguageLoader | null = null;

/**
 * 注入自定义语言加载器。返回 `null` 时回退到默认内置白名单。
 * 建议按需 `import` 语言模块，避免引入全量语言包。
 *
 * @example 按需加载额外语言
 * ```ts
 * import { setupCodeHighlighter } from "@antdv-next/x";
 * import type { LanguageInput } from "shiki";
 *
 * setupCodeHighlighter({
 *   loadLanguage: async (lang) => {
 *     const loaders: Record<string, () => Promise<{ default: LanguageInput }>> = {
 *       go: () => import("shiki/dist/langs/go.mjs"),
 *       rust: () => import("shiki/dist/langs/rust.mjs"),
 *     };
 *     const loader = loaders[lang];
 *     return loader ? (await loader()).default : null;
 *   },
 * });
 * ```
 */
export function setupCodeHighlighter(
  options: SetupCodeHighlighterOptions = {},
) {
  customLoader = options.loadLanguage ?? null;
  failedLangs.clear();
}

let highlighter: CodeHighlighterInstance | null = null;
let highlighterPromise: Promise<CodeHighlighterInstance> | null = null;
const loadedLangs = new Set<string>();
const failedLangs = new Set<string>();
const languageLoadPromises = new Map<string, Promise<boolean>>();

function normalizeLanguage(language: string | undefined): string {
  return (language || "text").toLowerCase();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getHighlighter() {
  if (highlighter) return highlighter;
  if (!highlighterPromise) {
    highlighterPromise = import("./shiki-runtime").then(
      ({ createHighlighter }) => createHighlighter(),
    );
  }
  highlighter = await highlighterPromise;
  return highlighter;
}

async function loadLang(lang: string) {
  if (loadedLangs.has(lang)) return true;
  if (failedLangs.has(lang) || PLAIN_TEXT_LANGUAGES.has(lang)) return false;

  const pendingLoad = languageLoadPromises.get(lang);
  if (pendingLoad) return pendingLoad;

  const loadPromise = (async () => {
    try {
      const registration =
        (await customLoader?.(lang)) ?? (await defaultLoader(lang));
      if (!registration) {
        failedLangs.add(lang);
        return false;
      }
      const instance = await getHighlighter();
      await instance.loadLanguage(registration);
      loadedLangs.add(lang);
      return true;
    } catch (error) {
      const loadError =
        error instanceof Error ? error : new Error(String(error));
      failedLangs.add(lang);
      console.warn(
        `[CodeHighlighter] Failed to load language: ${lang}`,
        loadError,
      );
      return false;
    } finally {
      languageLoadPromises.delete(lang);
    }
  })();

  languageLoadPromises.set(lang, loadPromise);
  return loadPromise;
}

export async function codeToHtml(
  code: string,
  options: { lang?: string; theme?: string } = {},
) {
  const lang = normalizeLanguage(options.lang);
  const hasLang = await loadLang(lang);

  if (!hasLang) return `<pre><code>${escapeHtml(code)}</code></pre>`;

  const instance = await getHighlighter();
  return instance.codeToHtml(code, {
    lang,
    theme: options.theme || "vitesse-light",
  });
}
