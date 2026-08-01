import { createHighlighterCore } from "shiki/core";
import darkTheme from "shiki/dist/themes/vitesse-dark.mjs";
import lightTheme from "shiki/dist/themes/vitesse-light.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type CodeHighlighterInstance = Awaited<
  ReturnType<typeof createHighlighterCore>
>;

export function createHighlighter() {
  return createHighlighterCore({
    themes: [lightTheme, darkTheme],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
}
