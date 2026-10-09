/**
 * 是否处于「减少动态效果」偏好下。
 *
 * 组件里需要跳过的程序化滚动与动画读这里，CSS 侧对应
 * `@media (prefers-reduced-motion: reduce)`，两侧必须成对处理。
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
