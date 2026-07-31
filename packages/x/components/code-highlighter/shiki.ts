import { createHighlighterCore } from "shiki/core";
import darkTheme from "shiki/dist/themes/vitesse-dark.mjs";
import lightTheme from "shiki/dist/themes/vitesse-light.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";

type Highlighter = Awaited<ReturnType<typeof createHighlighterCore>>;

const PLAIN_TEXT_LANGUAGES = new Set(["text", "plaintext", "txt", "plain"]);

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

  const loader = bundledLanguages[lang as keyof typeof bundledLanguages];
  if (!loader) {
    const error = new Error(`Unknown language: ${lang}`);
    failedLangs.add(lang);
    console.warn(`[CodeHighlighter] Failed to load language: ${lang}`, error);
    return false;
  }

  const loadPromise = (async () => {
    try {
      const mod = await loader();
      const instance = await getHighlighter();
      await instance.loadLanguage(mod.default);
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
