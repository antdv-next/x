import type { CSSProperties, VNodeChild } from "vue";

import { clsx } from "@v-c/util";
import { computed, defineComponent } from "vue";

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
  classes?: Record<string, string | undefined>;
  styles?: Record<string, CSSProperties | undefined>;
}

/**
 * 单个任务行：状态图标、标题（带删除线）、详情。
 *
 * 标题用 `title` 属性兜底展示全文，因为样式上会做单行截断。
 */
export default defineComponent<TodoItemRowProps>(props => {
  const titleCls = computed(() => `${props.prefixCls}-item-title`);

  return () => (
    <li
      class={clsx(`${props.prefixCls}-item`, props.classes?.item)}
      style={props.styles?.item}
      data-status={props.status}
      data-index={props.index}
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
          class={clsx(titleCls.value, props.classes?.itemTitle)}
          style={props.styles?.itemTitle}
          title={props.item.title}
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
    </li>
  );
});
