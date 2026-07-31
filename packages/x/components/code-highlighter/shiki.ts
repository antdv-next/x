import { createHighlighterCore } from "shiki/core";
import darkTheme from "shiki/dist/themes/vitesse-dark.mjs";
import lightTheme from "shiki/dist/themes/vitesse-light.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;
type LanguageLoader = (lang: string) => Promise<any>;

const PLAIN_TEXT_LANGUAGES = new Set(["text", "plaintext", "txt", "plain"]);

/**
 * 内置热门语言白名单。
 * 使用静态 import 路径，打包时仅生成这几个语言对应的 chunk。
 */
const BUILTIN_LANGUAGES: Record<string, () => Promise<{ default: any }>> = {
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

const defaultLoader: LanguageLoader = async lang => {
  const loader = BUILTIN_LANGUAGES[BUILTIN_ALIASES[lang] ?? lang];
  return loader ? (await loader()).default : null;
};

let activeLoader: LanguageLoader = defaultLoader;

/**
 * 注入自定义语言加载器，覆盖默认内置白名单。
 * 可接入 Shiki 全量 `bundledLanguages`、CDN 等任意来源。
 *
 * @example 接入全量 Shiki 语言
 * ```ts
 * import { bundledLanguages } from "shiki/langs";
 * import { setupCodeHighlighter } from "@antdv-next/x";
 *
 * setupCodeHighlighter({
 *   loadLanguage: async (lang) => {
 *     const loader = bundledLanguages[lang as keyof typeof bundledLanguages];
 *     return loader ? (await loader()).default : null;
 *   },
 * });
 * ```
 */
export function setupCodeHighlighter(options: {
  loadLanguage?: LanguageLoader;
}) {
  if (options?.loadLanguage) activeLoader = options.loadLanguage;
}

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;
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
    highlighterPromise = createHighlighterCore({
      themes: [lightTheme, darkTheme],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
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
      const registration = await activeLoader(lang);
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
