import type { CSSProperties } from "vue";

import { clsx } from "@v-c/util";
import { computed, defineComponent } from "vue";

import type { TodoItemStatus } from "../types";

import { clampProgress } from "../utils";

/** 进度弧半径；周长 `2πr` 用来把百分比换算成 `stroke-dashoffset`。 */
const RADIUS = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * 对勾与叉号的路径长度，作为 `stroke-dasharray` 的取值。
 *
 * 长度取值只要不小于真实路径长度即可：`dashoffset` 等于它时整条路径都在虚线间隙里，
 * 因此「未画出」；过渡到 0 时路径被逐渐描出来。
 */
const CHECK_PATH_LENGTH = 16;
const CROSS_PATH_LENGTH = 12;

export interface TodoStatusIconProps {
  prefixCls: string;
  status: TodoItemStatus;
  /** 仅 `in-progress` 使用，取值 0–100。 */
  progress?: number;
  class?: string;
  style?: CSSProperties;
}

/**
 * 状态图标：四种状态共用同一个 `<svg>`，靠状态类切换显隐与描绘动画。
 *
 * - `pending`：虚线圆
 * - `in-progress`：底圈 + 进度弧，整组随外圈无限旋转
 * - `completed`：对勾描绘
 * - `cancelled`：叉号描绘
 *
 * 对勾与叉号始终渲染，只用 `stroke-dashoffset` 表达「画出多少」——`display` 切换无法
 * 过渡，而描绘动画正是靠过渡完成的。
 *
 * 图标纯装饰，语义由行上的视觉隐藏文本承载，因此整体 `aria-hidden`。
 */
export default defineComponent<TodoStatusIconProps>(props => {
  const statusCls = computed(() => `${props.prefixCls}-status-${props.status}`);

  /** 进度弧的 `stroke-dashoffset`：0 表示画满。 */
  const arcOffset = computed(
    () => CIRCUMFERENCE * (1 - clampProgress(props.progress) / 100),
  );

  return () => (
    <span
      class={clsx(`${props.prefixCls}-status`, statusCls.value, props.class)}
      style={props.style}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none">
        {/* 待办：虚线圆 */}
        <circle
          class={`${props.prefixCls}-status-pending-circle`}
          cx="12"
          cy="12"
          r={RADIUS}
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="2 3"
        />

        {/* 进行中：底圈 + 进度弧，整组随外圈旋转 */}
        <g
          class={`${props.prefixCls}-status-progress-ring`}
          transform="rotate(-90 12 12)"
        >
          <circle
            cx="12"
            cy="12"
            r={RADIUS}
            stroke="currentColor"
            stroke-width="2"
            opacity="0.25"
          />
          <circle
            class={`${props.prefixCls}-status-progress-arc`}
            cx="12"
            cy="12"
            r={RADIUS}
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray={CIRCUMFERENCE}
            stroke-dashoffset={arcOffset.value}
          />
        </g>

        {/* 完成：对勾，靠 dashoffset 从「未画出」过渡到 0 */}
        <path
          class={`${props.prefixCls}-status-check`}
          d="M7 12.5 10.5 16 17 8.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-dasharray={CHECK_PATH_LENGTH}
          stroke-dashoffset={CHECK_PATH_LENGTH}
        />

        {/* 取消：叉号，同样靠 dashoffset 描绘 */}
        <path
          class={`${props.prefixCls}-status-cross`}
          d="M8 8 16 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray={CROSS_PATH_LENGTH}
          stroke-dashoffset={CROSS_PATH_LENGTH}
        />
        <path
          class={`${props.prefixCls}-status-cross`}
          d="M16 8 8 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray={CROSS_PATH_LENGTH}
          stroke-dashoffset={CROSS_PATH_LENGTH}
        />
      </svg>
    </span>
  );
});
