/**
 * 填充 `{name}` 占位符；未提供的占位符原样保留，便于暴露缺失的插值。
 */
export function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
