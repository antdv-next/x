export const DEFAULT_ITEM_SELECTOR = "[data-message-id]";
export const DEFAULT_FOLLOW_THRESHOLD = 56;
export const DEFAULT_SMOOTH = true;

/**
 * 平滑滚动的落位窗口，单位毫秒。
 *
 * 程序化滚动期间视口会连续发出滚动事件：贴底跟随用它屏蔽自身触发的事件，导轨用它把显式
 * 选中的刻度钉住——两者等的是同一件事，即这次平滑滚动落位。
 */
export const PROGRAMMATIC_SCROLL_WINDOW = 320;

const PREVIEW_TITLE_LENGTH = 56;
const PREVIEW_DESCRIPTION_LENGTH = 88;
/** 邻近衰减：Δi = 0 → 1，Δi = 1 → 0.68，Δi = 2 → 0.44，其余 0.25。 */
const RAIL_SCALE_STEPS = [1, 0.68, 0.44];
const RAIL_SCALE_FLOOR = 0.25;

const ITEM_ID_ATTRIBUTE = /\[([\w-]+)\]/;

/** 跨组件复用的实现放在 `_util`，这里只做转出，保持既有导入路径稳定。 */
export { prefersReducedMotion } from "../_util/motion";
export { formatTemplate as formatMessageScrollerTemplate } from "../_util/template";

/**
 * 导轨刻度的距离衰减比例。
 */
export function resolveRailScale(distance: number) {
  return RAIL_SCALE_STEPS[distance] ?? RAIL_SCALE_FLOOR;
}

/**
 * 从消息节点上读出导轨标识。
 *
 * 选择器是简单属性选择器时按属性取值，否则退化为节点序号。
 */
export function resolveItemId(
  element: HTMLElement,
  index: number,
  selector: string,
) {
  const attribute = selector.match(ITEM_ID_ATTRIBUTE)?.[1];
  const value = attribute ? element.getAttribute(attribute) : null;
  return value ?? String(index);
}

function truncateMessageText(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }

  const excerpt = text.slice(0, limit);
  const boundary = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, boundary > limit * 0.65 ? boundary : limit).trim()}…`;
}

/**
 * 消息节点文本退化出的预览标题与描述。
 */
export function resolveElementPreview(element: HTMLElement) {
  const text = (element.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return {};
  }

  if (text.length <= PREVIEW_TITLE_LENGTH) {
    return { title: text };
  }

  const titleExcerpt = text.slice(0, PREVIEW_TITLE_LENGTH);
  const boundary = titleExcerpt.lastIndexOf(" ");
  const titleEnd =
    boundary > PREVIEW_TITLE_LENGTH * 0.65 ? boundary : PREVIEW_TITLE_LENGTH;

  return {
    title: `${text.slice(0, titleEnd).trim()}…`,
    description: truncateMessageText(
      text.slice(titleEnd).trim(),
      PREVIEW_DESCRIPTION_LENGTH,
    ),
  };
}
