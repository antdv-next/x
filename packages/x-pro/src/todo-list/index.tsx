import type { App, SlotsType } from "vue";

import { clsx } from "@v-c/util";
import { useBaseConfig } from "antdv-next/config-provider/context";
import useCSSVarCls from "antdv-next/config-provider/hooks/useCSSVarCls";
import { useLocaleContext } from "antdv-next/locale/index";
import { computed, defineComponent, shallowRef, Transition } from "vue";

import type { TodoListLocale, XProLocale } from "../locale/types";
import type {
  TodoItem,
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
import { useTodoListOpen } from "./hooks/useTodoListOpen";
import { useTodoListScroll } from "./hooks/useTodoListScroll";
import useStyle from "./style";
import { DEFAULT_MAX_HEIGHT } from "./style/token";
import {
  countCompleted,
  deriveOverallStatus,
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

    const completed = computed(() => countCompleted(mergedItems.value));
    const total = computed(() => mergedItems.value.length);
    const overallStatus = computed(() =>
      deriveOverallStatus(mergedItems.value),
    );
    const overallProgress = computed(() =>
      resolveOverallProgress(mergedItems.value),
    );

    /**
     * 展开状态是受控 / 非受控共用的唯一入口：状态变化同时对外广播
     * `update:open` 与 `openChange`。
     */
    function updateOpen(next: boolean) {
      emit("update:open", next);
      emit("openChange", next);
    }

    const openState = useTodoListOpen({
      items: mergedItems,
      open: computed(() => props.open),
      defaultOpen: mergedDefaultOpen,
      collapseOnComplete: mergedCollapseOnComplete,
      setOpen: updateOpen,
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
          <ul
            class={clsx(`${prefixCls.value}-list`, mergedClassNames.value.list)}
            style={mergedStyles.value.list}
            aria-label={mergedTitle.value}
          >
            {mergedItems.value.map((item, index) => {
              const status = resolveTodoStatus(item);
              const slotProps = { item, index, status };

              return (
                <TodoItemRow
                  key={item.id}
                  prefixCls={prefixCls.value}
                  item={item}
                  index={index}
                  status={status}
                  statusLabel={statusLabels.value[status]}
                  titleContent={slots.itemTitle?.(slotProps) ?? item.title}
                  detailContent={
                    slots.itemDetail?.(slotProps) ?? item.detail ?? null
                  }
                  classes={{
                    item: mergedClassNames.value.item,
                    itemIcon: mergedClassNames.value.itemIcon,
                    itemTitle: mergedClassNames.value.itemTitle,
                    itemStrikethrough: mergedClassNames.value.itemStrikethrough,
                    itemDetail: mergedClassNames.value.itemDetail,
                  }}
                  styles={{
                    item: mergedStyles.value.item,
                    itemIcon: mergedStyles.value.itemIcon,
                    itemTitle: mergedStyles.value.itemTitle,
                    itemStrikethrough: mergedStyles.value.itemStrikethrough,
                    itemDetail: mergedStyles.value.itemDetail,
                  }}
                />
              );
            })}
          </ul>
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
