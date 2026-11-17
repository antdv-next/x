import type { CSSProperties, VNodeChild } from "vue";

import { clsx } from "@v-c/util";
import { computed, defineComponent, Transition } from "vue";

import type { TodoItem, TodoItemStatus } from "../types";

import TodoStatusIcon from "./TodoStatusIcon";

export interface TodoItemRowProps {
  prefixCls: string;
  item: TodoItem;
  index: number;
  status: TodoItemStatus;
  /** 视觉隐藏的状态文本，供读屏使用。 */
  statusLabel: string;
  /** 已解析的行标题；调用方负责 slot > prop > null。 */
  titleContent?: VNodeChild;
  /** 已解析的行详情。 */
  detailContent?: VNodeChild;
  /** 该行是否拥有可展开内容（子任务或 itemExtra 插槽）。 */
  expandable?: boolean;
  /** 该行当前是否展开。 */
  expanded?: boolean;
  /** 点击展开入口。 */
  onToggleExpand?: () => void;
  /** 已解析的展开图标；调用方负责 slot > 内置箭头。 */
  expandIconContent?: VNodeChild;
  /** 行下方展开区的内容；仅 expanded 时渲染。 */
  extraContent?: VNodeChild;
  /** 展开区的行内缩进样式。 */
  extraStyle?: CSSProperties;
  /** 所在层级，写入 data-depth 供样式与测试读取。 */
  depth?: number;
  classes?: Record<string, string | undefined>;
  styles?: Record<string, CSSProperties | undefined>;
}

/**
 * 单个任务行：状态图标、标题（带删除线）、详情，以及可选的展开区。
 *
 * 标题用 `title` 属性兜底展示全文，因为样式上会做单行截断。
 *
 * 展开区作为 `li` 的最后一个子节点，借助 `flex-wrap: wrap` 与 `flex-basis: 100%`
 * 换到第二行；这样原有的三列（图标 / 主体 / 详情）DOM 与 class 完全不变，
 * 未使用展开能力的清单渲染结果与扩展前逐字一致。
 */
export default defineComponent<TodoItemRowProps>(props => {
  const titleCls = computed(() => `${props.prefixCls}-item-title`);
  /**
   * 与 style/index.ts 里的 `-item-extra-motion-*` 选择器逐字对应，
   * 少一段类名过渡就会静默失效（元素照常挂载，但时长为 0）。
   */
  const motionCls = computed(() => `${props.prefixCls}-item-extra-motion`);

  /**
   * 高度过渡由 JS hooks 驱动：`auto` 无法参与 CSS 过渡，必须在进入时量出
   * 实际高度，结束后再交还给内容，这样子树后续展开不会被裁掉。
   */
  function setHeight(node: Element, value: string) {
    const element = node as HTMLElement;
    element.style.height = value;
    element.style.opacity = value === "0px" ? "0" : "1";
  }

  /**
   * 标题点击也触发展开/收起，但跳过插槽里自带的交互元素（链接、按钮、输入框等），
   * 否则点自定义标题中的链接会连带把这一行折叠。
   */
  function onTitleClick(event: MouseEvent) {
    if (!props.expandable) {
      return;
    }
    const title = event.currentTarget as HTMLElement;
    const target = event.target as HTMLElement | null;
    // 标题自身带 role="button"，closest 会匹配到它，因此只在标题内部查找交互子元素。
    const interactive = target?.closest(
      "a, button, input, textarea, select, [role='button']",
    );
    if (interactive && title.contains(interactive) && interactive !== title) {
      return;
    }
    props.onToggleExpand?.();
  }

  /** 键盘可达：标题获得焦点后 Enter / Space 与点击等价。 */
  function onTitleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      props.onToggleExpand?.();
    }
  }

  return () => (
    <li
      class={clsx(
        `${props.prefixCls}-item`,
        {
          [`${props.prefixCls}-item-expandable`]: props.expandable,
          [`${props.prefixCls}-item-expanded`]: props.expanded,
        },
        props.classes?.item,
      )}
      style={props.styles?.item}
      data-status={props.status}
      data-index={props.index}
      data-depth={props.depth ?? 0}
    >
      <TodoStatusIcon
        prefixCls={props.prefixCls}
        status={props.status}
        progress={props.item.progress}
        class={props.classes?.itemIcon}
        style={props.styles?.itemIcon}
      />

      <span class={`${props.prefixCls}-item-body`}>
        <span
          class={clsx(
            titleCls.value,
            {
              [`${props.prefixCls}-item-title-clickable`]: props.expandable,
            },
            props.classes?.itemTitle,
          )}
          style={props.styles?.itemTitle}
          title={props.item.title}
          role={props.expandable ? "button" : undefined}
          tabindex={props.expandable ? 0 : undefined}
          aria-expanded={props.expandable ? props.expanded : undefined}
          onClick={props.expandable ? onTitleClick : undefined}
          onKeydown={props.expandable ? onTitleKeydown : undefined}
        >
          {props.titleContent}
          <span
            class={clsx(
              `${props.prefixCls}-item-strikethrough`,
              props.classes?.itemStrikethrough,
            )}
            style={props.styles?.itemStrikethrough}
            aria-hidden="true"
          />
        </span>
        <span class={`${props.prefixCls}-item-status-text`}>
          {props.statusLabel}
        </span>
      </span>

      {props.detailContent ? (
        <span
          class={clsx(
            `${props.prefixCls}-item-detail`,
            props.classes?.itemDetail,
          )}
          style={props.styles?.itemDetail}
        >
          {props.detailContent}
        </span>
      ) : null}

      {props.expandable ? (
        <button
          type="button"
          class={clsx(
            `${props.prefixCls}-item-expand-icon`,
            props.classes?.itemExpandIcon,
          )}
          style={props.styles?.itemExpandIcon}
          aria-expanded={props.expanded}
          onClick={() => props.onToggleExpand?.()}
        >
          {props.expandIconContent ?? (
            <svg
              viewBox="0 0 1024 1024"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M340.6 148.6 682 512 340.6 875.4l60.4 60.4L780.8 512 401 88.2z" />
            </svg>
          )}
        </button>
      ) : null}

      <Transition
        name={motionCls.value}
        onBeforeEnter={el => setHeight(el, "0px")}
        onEnter={el => setHeight(el, `${(el as HTMLElement).scrollHeight}px`)}
        onAfterEnter={el => setHeight(el, "auto")}
        onBeforeLeave={el =>
          setHeight(el, `${(el as HTMLElement).scrollHeight}px`)
        }
        onLeave={el => {
          // 先落一次布局，让浏览器从当前高度开始过渡而不是直接跳到 0。
          void (el as HTMLElement).offsetHeight;
          setHeight(el, "0px");
        }}
        onAfterLeave={el => {
          const element = el as HTMLElement;
          element.style.height = "";
          element.style.opacity = "";
        }}
      >
        {props.expandable && props.expanded ? (
          <div
            class={clsx(
              `${props.prefixCls}-item-extra`,
              props.classes?.itemExtra,
            )}
            style={[props.extraStyle, props.styles?.itemExtra]}
          >
            {props.extraContent}
          </div>
        ) : null}
      </Transition>
    </li>
  );
});
