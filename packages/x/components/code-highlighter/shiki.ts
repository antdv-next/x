import { createHighlighterCore } from "shiki/core";
import darkTheme from "shiki/dist/themes/vitesse-dark.mjs";
import lightTheme from "shiki/dist/themes/vitesse-light.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

const SUPPORTED_LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  md: "markdown",
  yml: "yaml",
  shell: "bash",
  zsh: "bash",
  sh: "bash",
  vue: "vue",
};

const LANG_LOADERS: Record<string, () => Promise<{ default: any }>> = {
  javascript: () => import("shiki/dist/langs/javascript.mjs"),
  typescript: () => import("shiki/dist/langs/typescript.mjs"),
  jsx: () => import("shiki/dist/langs/jsx.mjs"),
  tsx: () => import("shiki/dist/langs/tsx.mjs"),
  json: () => import("shiki/dist/langs/json.mjs"),
  bash: () => import("shiki/dist/langs/bash.mjs"),
  markdown: () => import("shiki/dist/langs/markdown.mjs"),
  html: () => import("shiki/dist/langs/html.mjs"),
  css: () => import("shiki/dist/langs/css.mjs"),
  vue: () => import("shiki/dist/langs/vue.mjs"),
  "vue-html": () => import("shiki/dist/langs/vue-html.mjs"),
  python: () => import("shiki/dist/langs/python.mjs"),
  mermaid: () => import("shiki/dist/langs/mermaid.mjs"),
  yaml: () => import("shiki/dist/langs/yaml.mjs"),
  diff: () => import("shiki/dist/langs/diff.mjs"),
};

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLangs = new Set<string>();
const failedLangs = new Set<string>();

function normalizeLanguage(language: string | undefined): string {
  const input = (language || "text").toLowerCase();
  return SUPPORTED_LANG_ALIASES[input] || input;
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
  if (failedLangs.has(lang)) return false;

  const loader = LANG_LOADERS[lang];
  const loadLangModule = async () => {
    if (loader) return loader();
    // Fallback to dynamic language loading so callers can use more Shiki langs
    // without maintaining a static mapping in this package.
    if (!/^[a-z0-9-]+$/i.test(lang)) return null;
    return import(
      /* @vite-ignore */
      `shiki/dist/langs/${lang}.mjs`
    );
  };

  try {
    const mod = await loadLangModule();
    if (!mod?.default) {
      failedLangs.add(lang);
      return false;
    }
    const instance = await getHighlighter();
    await instance.loadLanguage(mod.default);
    loadedLangs.add(lang);
    return true;
  } catch {
    failedLangs.add(lang);
    return false;
  }
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
