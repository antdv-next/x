type OxfmtFormat = (typeof import("oxfmt"))["format"];

let oxfmtPromise: Promise<OxfmtFormat | null> | null = null;

async function getOxfmtFormat() {
  if (!oxfmtPromise) {
    oxfmtPromise = (async () => {
      try {
        const { format } = await import("oxfmt");
        return format;
      } catch {
        return null;
      }
    })();
  }
  return oxfmtPromise;
}

/**
 * demo 源码 TS -> JS 转换后的排版格式化（oxfmt）。
 * oxfmt 不可用时静默降级为不格式化。
 */
export function createOxfmtJsFormatter() {
  return async (code: string, lang: string) => {
    try {
      const oxfmtFormat = await getOxfmtFormat();
      if (!oxfmtFormat) return code;

      const filePath = `virtual-demo-script.${lang === "tsx" ? "jsx" : "js"}`;
      const result = await oxfmtFormat(filePath, code);
      return result.errors.length > 0 ? code : result.code;
    } catch {
      return code;
    }
  };
}
