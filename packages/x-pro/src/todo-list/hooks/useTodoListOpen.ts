import type { ComputedRef, Ref } from "vue";

import { computed, ref, watch } from "vue";

import type { TodoItem } from "../types";

import { areAllTerminal } from "../utils";

export interface TodoListOpenOptions {
  items: Ref<TodoItem[]>;
  /** 受控的展开状态，`undefined` 表示非受控。 */
  open: ComputedRef<boolean | undefined>;
  defaultOpen: Ref<boolean>;
  collapseOnComplete: Ref<boolean>;
  /** 状态变化统一出口，负责广播 `update:open` 与 `openChange`。 */
  setOpen: (open: boolean) => void;
}

/**
 * 展开状态机：非受控初值、终态自动折叠、以及新增任务后的自动展开。
 *
 * 自动展开只撤销「自己造成的」折叠：用户手动折叠过面板时，新增任务不得把它顶开，
 * 否则宿主无法用这一属性表达「收起」的意图。
 */
export function useTodoListOpen(options: TodoListOpenOptions) {
  const { items, open, defaultOpen, collapseOnComplete, setOpen } = options;

  const innerOpen = ref(defaultOpen.value);
  /** 当前折叠是否由自动折叠造成；任何手动切换都会清除它。 */
  const autoCollapsed = ref(false);

  const mergedOpen = computed(() => open.value ?? innerOpen.value);

  /**
   * 写入展开状态并广播。
   *
   * `auto` 标记这次折叠是否由自动折叠发起，它是「之后要不要自动展开」的唯一依据。
   */
  function apply(next: boolean, auto: boolean) {
    innerOpen.value = next;
    autoCollapsed.value = auto && !next;
    setOpen(next);
  }

  watch(defaultOpen, value => {
    if (open.value === undefined) {
      innerOpen.value = value;
      autoCollapsed.value = false;
    }
  });

  /** 宿主把 `open` 拨回展开时，之前的自动折叠作废。 */
  watch(open, value => {
    if (value === true) {
      autoCollapsed.value = false;
    }
  });

  watch(
    items,
    next => {
      if (!collapseOnComplete.value) {
        return;
      }

      if (areAllTerminal(next)) {
        // `autoCollapsed` 兼作去重标记：受控宿主忽略这次广播时不会反复收到同一事件。
        if (mergedOpen.value && !autoCollapsed.value) {
          apply(false, true);
        }
        return;
      }

      // 新增任务后重新展开，但只还原自动折叠，不动用户自己的选择。
      if (autoCollapsed.value && !mergedOpen.value) {
        apply(true, false);
      }
    },
    { deep: true },
  );

  return {
    innerOpen,
    mergedOpen,
    /** 手动切换：清除自动折叠标记，此后新增任务不再自动展开。 */
    toggle() {
      apply(!mergedOpen.value, false);
    },
    /** 受控宿主通过实例方法写入时同步内部标记。 */
    markManual(next: boolean) {
      innerOpen.value = next;
      autoCollapsed.value = false;
    },
  };
}
