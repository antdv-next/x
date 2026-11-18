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
  /** 稳定标识，必须在整棵任务树内唯一，用于列表 diff 与展开状态。 */
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
  /**
   * 子任务。非空时该行显示展开入口；展开后默认递归渲染一棵子清单，
   * 也可由 `itemExtra` 插槽完全接管内容。
   */
  children?: TodoItem[];
  /**
   * 是否显示展开入口。缺省由 `children` 或 `itemExtra` 插槽决定；显式 `false`
   * 可关闭某行的展开能力。
   */
  expandable?: boolean;
  /**
   * 自定义节点数据，组件不解释，原样交给 `itemExtra` 等插槽消费。
   */
  payload?: unknown;
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
  /** 嵌套的子任务列表。 */
  listNested?: string;
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
  /** 任务行的展开入口按钮。 */
  itemExpandIcon?: string;
  /** 任务行下方的自定义内容区。 */
  itemExtra?: string;
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
  listNested?: CSSProperties;
  item?: CSSProperties;
  itemIcon?: CSSProperties;
  itemTitle?: CSSProperties;
  itemStrikethrough?: CSSProperties;
  itemDetail?: CSSProperties;
  itemExpandIcon?: CSSProperties;
  itemExtra?: CSSProperties;
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
  /**
   * 展开的任务行 id，受控，支持 `v-model:expandedKeys`。
   * 传入后组件只广播变化，不自行改写视图。
   */
  expandedKeys?: string[];
  /** 初始展开的任务行 id，非受控。 */
  defaultExpandedKeys?: string[];
  /**
   * 每展开一层，子内容相对父行左侧的缩进，单位 px。
   *
   * @default 20
   */
  indentSize?: number;
  /**
   * 头部计数是否递归纳入子任务。关闭时只统计传入的顶层 `items`，
   * 与未支持树形前的行为一致。
   *
   * @default false
   */
  recursiveCount?: boolean;
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
  /** 所在层级，根层为 0；旧消费者可忽略此字段。 */
  depth?: number;
}

/** 任务行展开区插槽的参数，在行参数之上补了展开状态与切换方法。 */
export interface TodoItemExtraSlotProps extends TodoItemSlotProps {
  /** 该行当前是否展开。 */
  expanded: boolean;
  /** 切换该行展开状态。 */
  toggle: () => void;
}

/**
 * 展开图标插槽的参数。图标只负责视觉，点击仍由组件的外层按钮统一处理，
 * 因此这里不提供 `toggle`，避免自定义图标内部再绑一次导致切换相互抵消。
 */
export interface TodoItemExpandIconSlotProps extends TodoItemSlotProps {
  /** 该行当前是否展开。 */
  expanded: boolean;
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
  /** 自定义任务行标题，优先于 `TodoItem.title`。使用此插槽时，标题点击不会切换展开状态。 */
  itemTitle?: (slotProps: TodoItemSlotProps) => any;
  /** 自定义任务行详情，优先于 `TodoItem.detail`。 */
  itemDetail?: (slotProps: TodoItemSlotProps) => any;
  /**
   * 任务行下方的自定义内容。存在时该行获得展开入口，插槽优先于默认的子任务递归渲染。
   */
  itemExtra?: (slotProps: TodoItemExtraSlotProps) => any;
  /** 自定义任务行的展开图标（仅视觉），点击仍由组件处理。 */
  itemExpandIcon?: (slotProps: TodoItemExpandIconSlotProps) => any;
  /** 自定义头部标题，优先于 `title` 与 locale。 */
  header?: (slotProps: TodoHeaderSlotProps) => any;
}

export interface TodoListEmits {
  /** 配合 `v-model:open` 使用。 */
  "update:open": (open: boolean) => void;
  /** 展开状态变化时触发。 */
  openChange: (open: boolean) => void;
  /** 配合 `v-model:expandedKeys` 使用。 */
  "update:expandedKeys": (keys: string[]) => void;
  /** 展开的行集合变化时触发。 */
  expandedKeysChange: (keys: string[]) => void;
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
  /** 当前展开的任务行 id。 */
  expandedKeys: string[];
  /** 设置展开的任务行 id。 */
  setExpandedKeys: (keys: string[]) => void;
  /** 展开所有带子任务或自定义内容的行。 */
  expandAll: () => void;
  /** 收起所有任务行。 */
  collapseAll: () => void;
  /** 滚动到列表底部。 */
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => void;
}
