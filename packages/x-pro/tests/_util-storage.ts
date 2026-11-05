import { JSDOM } from "jsdom";

/** Keep draft tests independent of Node's experimental global storage. */
export function installBrowserStorage() {
  const browser = new JSDOM("", { url: "https://questionnaire.test" });
  Object.defineProperty(globalThis.window, "localStorage", {
    configurable: true,
    value: browser.window.localStorage,
  });
}
