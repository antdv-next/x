import type { App, SlotsType, VNodeChild } from "vue";

import { clsx } from "@v-c/util";
import { useBaseConfig } from "antdv-next/config-provider/context";
import useCSSVarCls from "antdv-next/config-provider/hooks/useCSSVarCls";
import { useLocaleContext } from "antdv-next/locale/index";
import {
  Comment,
  computed,
  defineComponent,
  isVNode,
  shallowRef,
  Transition,
} from "vue";

import type { TodoListLocale, XProLocale } from "../locale/types";
import type {
  TodoItem,
  TodoItemExpandIconSlotProps,
  TodoItemSlotProps,
  TodoItemStatus,
  TodoListClassNamesType,
  TodoListEmits,
  TodoListProps,
  TodoListRef,
  TodoListSemanticClassNames,
  TodoListSemanticStyles,
  TodoListSlots,
  TodoListStylesType,
} from "./types";

import {
  omitClassAndStyle,
  resolveAttrClass,
  resolveAttrStyle,
} from "../_util/attrs";
import { useMergeSemantic } from "../_util/semantic";
import { formatTemplate } from "../_util/template";
import { useXProComponentConfig } from "../config-provider";
import enUSLocale from "../locale/en_US";
import TodoDisclosure from "./components/TodoDisclosure";
import TodoItemRow from "./components/TodoItemRow";
import TodoStatusIcon from "./components/TodoStatusIcon";
import { useTodoListExpandedKeys } from "./hooks/useTodoListExpandedKeys";
import { useTodoListOpen } from "./hooks/useTodoListOpen";
import { useTodoListScroll } from "./hooks/useTodoListScroll";
import useStyle from "./style";
import { DEFAULT_INDENT_SIZE, DEFAULT_MAX_HEIGHT } from "./style/token";
import {
  collectExpandableIds,
  countCompleted,
  deriveOverallStatus,
  flattenItems,
  resolveOverallProgress,
  resolveTodoStatus,
} from "./utils";

export type TodoListSemanticName = keyof TodoListSemanticClassNames &
  keyof TodoListSemanticStyles;

/**
 * Vue 的 `EmitsOptions` 需要隐式索引签名，接口不会提供，因此这里用映射类型桥接。
 */
type TodoListEmitOptions = {
  [K in keyof TodoListEmits]: TodoListEmits[K];
};

/**
 * 判断插槽是否给出了「实质内容」。
 *
 * Vue 会把 `v-if` 为假的插槽分支编译成注释 VNode，直接判 `!= null` 会把它
 * 误当成有效内容，从而盖掉默认的子任务递归渲染。这里递归剥掉数组与注释节点。
 */
function hasSlotContent(value: unknown): boolean {
  if (value === null || value === undefined || typeof value === "boolean") {
    return false;
  }
  if (Array.isArray(value)) {
    return value.some(hasSlotContent);
  }
  if (isVNode(value)) {
    if (value.type === Comment) {
      return false;
    }
    if (Array.isArray(value.children)) {
      return value.children.some(hasSlotContent);
    }
    return true;
  }
  return true;
}

const TodoList = defineComponent<
  TodoListProps,
  TodoListEmitOptions,
  string,
  SlotsType<TodoListSlots>
>(
  (props, { attrs, emit, expose, slots }) => {
    const { prefixCls, direction } = useBaseConfig("todo-list", props);
    const xProConfig = useXProComponentConfig("todoList");
    const localeContext = useLocaleContext();
    const rootRef = shallowRef<HTMLElement>();
    const viewportRef = shallowRef<HTMLElement>();
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const localeText = computed<TodoListLocale>(() => ({
      ...enUSLocale.TodoList,
      ...(localeContext.locale.value as XProLocale | undefined)?.TodoList,
    }));

    const mergedItems = computed<TodoItem[]>(() => props.items ?? []);
    const mergedMaxHeight = computed(
      () => props.maxHeight ?? xProConfig.value.maxHeight ?? DEFAULT_MAX_HEIGHT,
    );
    const mergedCollapseOnComplete = computed(
      () =>
        props.collapseOnComplete ?? xProConfig.value.collapseOnComplete ?? true,
    );
    const mergedTitle = computed(
      () => props.title ?? xProConfig.value.title ?? localeText.value.title,
    );
    const mergedDefaultOpen = computed(
      () => props.defaultOpen ?? xProConfig.value.defaultOpen ?? true,
    );
    const mergedIndentSize = computed(
      () => props.indentSize ?? DEFAULT_INDENT_SIZE,
    );
    const mergedRecursiveCount = computed(() => props.recursiveCount ?? false);
    const mergedDefaultExpandedKeys = computed<string[]>(() =>
      Array.isArray(props.defaultExpandedKeys) ? props.defaultExpandedKeys : [],
    );

    /**
     * 统计口径：递归计数开启时先深度展平，否则原样使用顶层 items。
     *
     * 这样既不改动 utils 里既有函数的签名，也让「计数 / 进度 / 折叠判定」
     * 三处共享同一份数据，避免顶层全完成但子树还在跑时提前折叠。
     */
    const statsItems = computed<TodoItem[]>(() =>
      mergedRecursiveCount.value
        ? flattenItems(mergedItems.value)
        : mergedItems.value,
    );

    const completed = computed(() => countCompleted(statsItems.value));
    const total = computed(() => statsItems.value.length);
    const overallStatus = computed(() => deriveOverallStatus(statsItems.value));
    const overallProgress = computed(() =>
      resolveOverallProgress(statsItems.value),
    );

    /**
     * 展开状态是受控 / 非受控共用的唯一入口：状态变化同时对外广播
     * `update:open` 与 `openChange`。
     */
    function updateOpen(next: boolean) {
      emit("update:open", next);
      emit("openChange", next);
    }

    function updateExpandedKeys(next: string[]) {
      emit("update:expandedKeys", next);
      emit("expandedKeysChange", next);
    }

    const openState = useTodoListOpen({
      items: statsItems,
      open: computed(() => props.open),
      defaultOpen: mergedDefaultOpen,
      collapseOnComplete: mergedCollapseOnComplete,
      setOpen: updateOpen,
    });

    const expandedState = useTodoListExpandedKeys({
      expandedKeys: computed(() => props.expandedKeys),
      defaultExpandedKeys: mergedDefaultExpandedKeys,
      setExpandedKeys: updateExpandedKeys,
    });

    const mergedOpen = openState.mergedOpen;

    const scroll = useTodoListScroll({
      viewport: viewportRef,
      items: mergedItems,
      open: mergedOpen,
    });

    const statusLabels = computed<Record<TodoItemStatus, string>>(() => ({
      pending: localeText.value.statusPending,
      "in-progress": localeText.value.statusInProgress,
      completed: localeText.value.statusCompleted,
      cancelled: localeText.value.statusCancelled,
    }));

    const counterText = computed(() =>
      formatTemplate(localeText.value.counterLabel, {
        completed: completed.value,
        total: total.value,
      }),
    );

    const mergedSemanticProps = computed<TodoListProps>(() => ({
      ...props,
      title: mergedTitle.value,
      maxHeight: mergedMaxHeight.value,
      collapseOnComplete: mergedCollapseOnComplete.value,
      defaultOpen: mergedDefaultOpen.value,
    }));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      TodoListSemanticClassNames,
      TodoListSemanticStyles,
      TodoListProps
    >(
      computed(() => [
        xProConfig.value.classes as TodoListClassNamesType | undefined,
        props.classes,
      ]),
      computed(() => [
        xProConfig.value.styles as TodoListStylesType | undefined,
        props.styles,
      ]),
      computed(() => ({ props: mergedSemanticProps.value })),
    );

    const mergedClassName = computed(() =>
      clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === "rtl",
          [`${prefixCls.value}-open`]: mergedOpen.value,
        },
        xProConfig.value.class,
        props.rootClass,
        mergedClassNames.value.root,
        resolveAttrClass((attrs as Record<string, unknown>).class),
      ),
    );

    const mergedStyle = computed(() => [
      mergedStyles.value.root,
      xProConfig.value.style,
      resolveAttrStyle((attrs as Record<string, unknown>).style),
    ]);

    const contentId = `${prefixCls.value}-content`;

    function probeItemExtra(item: TodoItem, index: number, depth: number) {
      return slots.itemExtra?.({
        item,
        index,
        depth,
        status: resolveTodoStatus(item),
        expanded: true,
        toggle: () => expandedState.toggle(item.id),
      });
    }

    /**
     * 渲染单个任务行。抽成函数供顶层与子清单递归共用，
     * 所有插槽参数都带上 depth，宿主可据此调整自定义内容的层级表现。
     */
    function renderRow(
      item: TodoItem,
      index: number,
      depth: number,
    ): VNodeChild {
      const status = resolveTodoStatus(item);
      const baseProps: TodoItemSlotProps = { item, index, status, depth };
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;
      const selfExpanded = expandedState.isExpanded(item.id);

      /**
       * 探测该行有没有「展开后值得展示的内容」，决定要不要画展开箭头。
       *
       * expanded 传 true：宿主常用 `v-if="expanded && ..."` 包裹展开内容，
       * 若按当前收起态探测会拿到注释节点，把有内容的行误判成叶子。
       * 探测结果在真正展开时直接复用，避免同一行多次调用插槽。
       */
      const probed = probeItemExtra(item, index, depth);
      const hasExtra = hasSlotContent(probed);

      // 纯叶子（既无子任务、插槽也无内容）不给箭头；显式 expandable: false 始终关闭。
      const expandable = item.expandable !== false && (hasChildren || hasExtra);
      const expanded = expandable && selfExpanded;

      let extraContent: VNodeChild = null;
      if (expanded) {
        if (hasExtra) {
          // 插槽优先：宿主完全接管展开区内容，包括是否渲染子清单。
          extraContent = probed;
        } else if (hasChildren) {
          // 缺省：递归渲染一棵子清单。子树继承 prefixCls 与统计口径，
          // 但拥有自己的 DOM 层级，缩进由 item-extra 的 padding 提供。
          extraContent = renderList(item.children ?? [], depth + 1, true);
        }
      }

      return (
        <TodoItemRow
          key={item.id}
          prefixCls={prefixCls.value}
          item={item}
          index={index}
          status={status}
          statusLabel={statusLabels.value[status]}
          titleContent={slots.itemTitle?.(baseProps) ?? item.title}
          detailContent={slots.itemDetail?.(baseProps) ?? item.detail ?? null}
          expandable={expandable}
          expanded={expanded}
          onToggleExpand={() => expandedState.toggle(item.id)}
          expandIconContent={slots.itemExpandIcon?.({
            ...baseProps,
            expanded,
          } as TodoItemExpandIconSlotProps)}
          extraContent={extraContent}
          extraStyle={{ paddingInlineStart: `${mergedIndentSize.value}px` }}
          depth={depth}
          classes={{
            item: mergedClassNames.value.item,
            itemIcon: mergedClassNames.value.itemIcon,
            itemTitle: mergedClassNames.value.itemTitle,
            itemStrikethrough: mergedClassNames.value.itemStrikethrough,
            itemDetail: mergedClassNames.value.itemDetail,
            itemExpandIcon: mergedClassNames.value.itemExpandIcon,
            itemExtra: mergedClassNames.value.itemExtra,
          }}
          styles={{
            item: mergedStyles.value.item,
            itemIcon: mergedStyles.value.itemIcon,
            itemTitle: mergedStyles.value.itemTitle,
            itemStrikethrough: mergedStyles.value.itemStrikethrough,
            itemDetail: mergedStyles.value.itemDetail,
            itemExpandIcon: mergedStyles.value.itemExpandIcon,
            itemExtra: mergedStyles.value.itemExtra,
          }}
        />
      );
    }

    /** 渲染一层清单。子清单只多一个 `-nested` 语义类，不重复头部与滚动容器。 */
    function renderList(
      items: TodoItem[],
      depth: number,
      nested = false,
    ): VNodeChild {
      return (
        <ul
          class={clsx(
            `${prefixCls.value}-list`,
            {
              [`${prefixCls.value}-list-nested`]: nested,
            },
            mergedClassNames.value.list,
            nested && mergedClassNames.value.listNested,
          )}
          style={[
            mergedStyles.value.list,
            nested && mergedStyles.value.listNested,
          ]}
          aria-label={nested ? undefined : mergedTitle.value}
        >
          {items.map((item, index) => renderRow(item, index, depth))}
        </ul>
      );
    }

    const api: TodoListRef = {
      get nativeElement() {
        return rootRef.value ?? null;
      },
      get viewportElement() {
        return viewportRef.value ?? null;
      },
      get open() {
        return mergedOpen.value;
      },
      setOpen: next => {
        openState.markManual(next);
        updateOpen(next);
      },
      get expandedKeys() {
        return [...expandedState.mergedKeys.value];
      },
      setExpandedKeys: keys => {
        expandedState.markKeys(keys);
        updateExpandedKeys([...new Set(keys)]);
      },
      expandAll: () => {
        expandedState.setKeys(
          collectExpandableIds(mergedItems.value, (item, index, depth) =>
            hasSlotContent(probeItemExtra(item, index, depth)),
          ),
        );
      },
      collapseAll: () => expandedState.setKeys([]),
      scrollToEnd: options => scroll.scrollToEnd(options),
    };

    expose(api);

    return () => (
      <div
        ref={rootRef}
        class={mergedClassName.value}
        style={mergedStyle.value}
        {...omitClassAndStyle(attrs as Record<string, unknown>)}
      >
        <button
          type="button"
          class={clsx(
            `${prefixCls.value}-header`,
            mergedClassNames.value.header,
          )}
          style={mergedStyles.value.header}
          aria-expanded={mergedOpen.value}
          aria-controls={contentId}
          aria-label={formatTemplate(localeText.value.toggleLabel, {
            title: mergedTitle.value,
          })}
          onClick={() => openState.toggle()}
        >
          <span
            class={clsx(
              `${prefixCls.value}-header-icon`,
              mergedClassNames.value.headerIcon,
            )}
            style={mergedStyles.value.headerIcon}
          >
            <TodoStatusIcon
              prefixCls={prefixCls.value}
              status={overallStatus.value}
              progress={overallProgress.value}
            />
          </span>

          <span
            class={clsx(
              `${prefixCls.value}-header-title`,
              mergedClassNames.value.title,
            )}
            style={mergedStyles.value.title}
          >
            {slots.header?.({
              open: mergedOpen.value,
              completed: completed.value,
              total: total.value,
              status: overallStatus.value,
            }) ?? mergedTitle.value}
          </span>

          <span
            class={clsx(
              `${prefixCls.value}-header-counter`,
              mergedClassNames.value.counter,
            )}
            style={mergedStyles.value.counter}
            aria-hidden="true"
          >
            {/* 计数用 keyed Transition 做数字滚动，减少动效时退化为直接替换。 */}
            <Transition
              name={`${prefixCls.value}-header-counter-motion`}
              mode="out-in"
            >
              <span key={counterText.value}>{counterText.value}</span>
            </Transition>
          </span>

          <span
            class={clsx(
              `${prefixCls.value}-header-arrow`,
              mergedClassNames.value.arrow,
            )}
            style={mergedStyles.value.arrow}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 1024 1024"
              width="1em"
              height="1em"
              fill="currentColor"
            >
              <path d="M340.6 148.6 682 512 340.6 875.4l60.4 60.4L780.8 512 401 88.2z" />
            </svg>
          </span>
        </button>

        <TodoDisclosure
          prefixCls={prefixCls.value}
          open={mergedOpen.value}
          maxHeight={mergedMaxHeight.value}
          id={contentId}
          class={mergedClassNames.value.content}
          style={mergedStyles.value.content}
          contentRef={viewportRef}
        >
          {renderList(mergedItems.value, 0)}
        </TodoDisclosure>
      </div>
    );
  },
  {
    name: "ATodoList",
    inheritAttrs: false,
  },
);

(TodoList as typeof TodoList & { install?: (app: App) => void }).install = (
  app: App,
) => {
  app.component(TodoList.name ?? "ATodoList", TodoList);
};

export type {
  TodoItem,
  TodoItemExpandIconSlotProps,
  TodoItemExtraSlotProps,
  TodoItemSlotProps,
  TodoItemStatus,
  TodoHeaderSlotProps,
  TodoListClassNamesType,
  TodoListEmits,
  TodoListProps,
  TodoListRef,
  TodoListSemanticClassNames,
  TodoListSemanticStyles,
  TodoListSlots,
  TodoListStylesType,
} from "./types";
export default TodoList;
export { TodoList };
