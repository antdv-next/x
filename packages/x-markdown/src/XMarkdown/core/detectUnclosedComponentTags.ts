const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const SELF_CLOSING_PATTERN = /\/\s*>$/;

export function detectUnclosedComponentTags(
  html: string,
  customComponentTags: string[],
): Set<string> {
  const unclosedTags = new Set<string>();
  const tagStack: Array<{ name: string; instanceId: string }> = [];
  let tagInstanceCounter: Record<string, number> = {};

  customComponentTags.forEach(tag => {
    tagInstanceCounter[tag] = 0;
  });

  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9-]*)[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(html)) !== null) {
    const fullMatch = match[0];
    const tagName = match[1].toLowerCase();

    if (!customComponentTags.includes(tagName)) {
      continue;
    }

    if (fullMatch.includes("<!--") || fullMatch.includes("<![CDATA[")) {
      continue;
    }

    const isSelfClosing = SELF_CLOSING_PATTERN.test(fullMatch);
    const isOpening = !fullMatch.startsWith("</");

    if (isSelfClosing || !isOpening) {
      continue;
    }

    const isVoid = VOID_ELEMENTS.has(tagName);
    if (isVoid) {
      continue;
    }

    if (isOpening) {
      tagInstanceCounter[tagName] = (tagInstanceCounter[tagName] || 0) + 1;
      const instanceId = `${tagName}-${tagInstanceCounter[tagName]}`;
      tagStack.push({ name: tagName, instanceId });
    } else {
      const closingTag = tagStack.findLast(item => item.name === tagName);
      if (closingTag) {
        const index = tagStack.lastIndexOf(closingTag);
        tagStack.splice(index, 1);
      }
    }
  }

  tagStack.forEach(item => {
    unclosedTags.add(item.instanceId);
  });

  return unclosedTags;
}
