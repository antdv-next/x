import type { CSSProperties } from "vue";

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from "../_util/semantic";

/**
 * 任务状态。
 *
 * `cancelled` 是终态的一种：它不再需要执行，但也不计入完成数。
 */
export type TodoItemStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface TodoItem {
  /** 稳定标识，用于列表 diff 与滚动定位。 */
  id: string;
  /** 任务标题。 */
  title: string;
  /**
   * 任务状态。
   *
   * @default 'pending'
   */
  status?: TodoItemStatus;
  /**
   * 任务进度，取值 0–100，仅在 `in-progress` 下渲染为进度弧。
   */
  progress?: number;
  /** 行尾的紧凑元信息，例如耗时或文件数。 */
  detail?: string;
  [key: string]: unknown;
}

export interface TodoListSemanticClassNames {
  /** 组件根元素。 */
  root?: string;
  /** 头部按钮，承载标题、计数与状态图标。 */
  header?: string;
  /** 头部状态图标。 */
  headerIcon?: string;
  /** 头部标题。 */
  title?: string;
  /** 完成计数。 */
  counter?: string;
  /** 头部展开箭头。 */
  arrow?: string;
  /** 可折叠内容层。 */
  content?: string;
  /** 任务列表。 */
  list?: string;
  /** 单个任务行。 */
  item?: string;
  /** 任务行状态图标。 */
  itemIcon?: string;
  /** 任务行标题。 */
  itemTitle?: string;
  /** 任务行删除线。 */
  itemStrikethrough?: string;
  /** 任务行详情。 */
  itemDetail?: string;
}

export interface TodoListSemanticStyles {
  root?: CSSProperties;
  header?: CSSProperties;
  headerIcon?: CSSProperties;
  title?: CSSProperties;
  counter?: CSSProperties;
  arrow?: CSSProperties;
  content?: CSSProperties;
  list?: CSSProperties;
  item?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  itemStrikethrough?: CSSProperties;
  itemDetail?: CSSProperties;
}

export type TodoListClassNamesType = SemanticClassNamesType<
  TodoListProps,
  TodoListSemanticClassNames
>;
export type TodoListStylesType = SemanticStylesType<
  TodoListProps,
  TodoListSemanticStyles
>;

export interface TodoListProps {
  prefixCls?: string;
  rootClass?: string;
  /** 任务条目。 */
  items?: TodoItem[];
  /**
   * 头部标题。
   *
   * @default 'To-dos'
   */
  title?: string;
  /**
   * 是否展开，受控，支持 `v-model:open`。
   *
   * 缺省为组件内部维护。
   */
  open?: boolean;
  /**
   * 初始展开状态，非受控。
   *
   * @default true
   */
  defaultOpen?: boolean;
  /**
   * 全部任务进入终态（completed 或 cancelled）后是否自动折叠。
   *
   * @default true
   */
  collapseOnComplete?: boolean;
  /**
   * 任务列表的最大高度，单位 px，超出后滚动。
   *
   * @default 248
   */
  maxHeight?: number;
  /** 用于自定义组件内部各语义化结构的 class，支持对象或函数。 */
  classes?: TodoListClassNamesType;
  /** 用于自定义组件内部各语义化结构的行内 style，支持对象或函数。 */
  styles?: TodoListStylesType;
}

export interface TodoItemSlotProps {
  item: TodoItem;
  index: number;
  /** 归一化后的状态，缺省补为 `pending`。 */
  status: TodoItemStatus;
}

export interface TodoHeaderSlotProps {
  open: boolean;
  /** 已完成任务数。 */
  completed: number;
  /** 任务总数。 */
  total: number;
  /** 由列表派生的整体状态。 */
  status: TodoItemStatus;
}

export interface TodoListSlots {
  /** 自定义任务行标题，优先于 `TodoItem.title`。 */
  itemTitle?: (slotProps: TodoItemSlotProps) => any;
  /** 自定义任务行详情，优先于 `TodoItem.detail`。 */
  itemDetail?: (slotProps: TodoItemSlotProps) => any;
  /** 自定义头部标题，优先于 `title` 与 locale。 */
  header?: (slotProps: TodoHeaderSlotProps) => any;
}

export interface TodoListEmits {
  /** 配合 `v-model:open` 使用。 */
  "update:open": (open: boolean) => void;
  /** 展开状态变化时触发。 */
  openChange: (open: boolean) => void;
}

export interface TodoListRef {
  /** 组件根元素。 */
  nativeElement: HTMLElement | null;
  /** 原生滚动容器。 */
  viewportElement: HTMLElement | null;
  /** 当前是否展开。 */
  open: boolean;
  /** 设置展开状态。 */
  setOpen: (open: boolean) => void;
  /** 滚动到列表底部。 */
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => void;
}
