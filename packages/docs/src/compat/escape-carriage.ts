/**
 * ESM compatibility layer for escape-carriage.
 * The upstream escape-carriage package is CommonJS with `module.exports = fn; module.exports.escapeCarriageReturn = fn;`,
 * which breaks in Vite when imported with named imports: `import { escapeCarriageReturn } from 'escape-carriage'` (used by ansi-to-vue3).
 */
export function escapeCarriageReturn(txt: string): string {
  if (!txt) return "";
  if (!/\r/.test(txt)) return txt;
  let result = txt.replace(/\r+\n/gm, "\n");
  while (/\r./.test(result)) {
    result = result.replace(/^([^\r\n]*)\r+([^\r\n]+)/gm, (_, base, insert) => {
      return insert + base.slice(insert.length);
    });
  }
  return result;
}

function findLongestString(arr: string[]): number {
  let longest = 0;
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const best = arr[longest];
    if (
      current !== undefined &&
      best !== undefined &&
      best.length <= current.length
    ) {
      longest = i;
    }
  }
  return longest;
}

export function escapeSingleLineSafe(txt: string): string {
  if (!/\r/.test(txt)) return txt;
  let arr = txt.split("\r");
  const res: string[] = [];

  while (arr.length > 0) {
    const longest = findLongestString(arr);
    const item = arr[longest];
    if (item !== undefined) {
      res.push(item);
    }
    arr = arr.slice(longest + 1);
  }

  return res.join("\r");
}

export function escapeCarriageReturnSafe(txt: string): string {
  if (!txt) return "";
  if (!/\r/.test(txt)) return txt;
  if (!/\n/.test(txt)) return escapeSingleLineSafe(txt);
  const normalized = txt.replace(/\r+\n/gm, "\n");
  const idx = normalized.lastIndexOf("\n");

  return (
    escapeCarriageReturn(normalized.slice(0, idx)) +
    "\n" +
    escapeSingleLineSafe(normalized.slice(idx + 1))
  );
}

export default escapeCarriageReturn;
