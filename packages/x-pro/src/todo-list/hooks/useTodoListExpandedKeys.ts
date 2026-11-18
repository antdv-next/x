import type { ComputedRef, Ref } from "vue";

import { computed, ref } from "vue";

export interface TodoListExpandedKeysOptions {
  /** 受控的展开行集合，`undefined` 表示非受控。 */
  expandedKeys: ComputedRef<string[] | undefined>;
  /** 非受控初值。 */
  defaultExpandedKeys: Ref<string[]>;
  /** 状态变化统一出口，负责广播两个展开事件。 */
  setExpandedKeys: (keys: string[]) => void;
}

/**
 * 任务行的展开状态机，与 `useTodoListOpen` 同构：
 * 非受控时内部持有一份 id 集合，受控时视图完全跟随 props，
 * 任何变化都经由 `setExpandedKeys` 对外广播。
 */
export function useTodoListExpandedKeys(options: TodoListExpandedKeysOptions) {
  const { expandedKeys, defaultExpandedKeys, setExpandedKeys } = options;

  const innerKeys = ref<string[]>([...defaultExpandedKeys.value]);

  const mergedKeys = computed<string[]>(() => {
    const value = expandedKeys.value;
    return Array.isArray(value) ? value : innerKeys.value;
  });

  const keySet = computed(() => new Set(mergedKeys.value));

  function apply(next: string[]) {
    // 去重且保持顺序，避免同一 id 反复进出导致无谓的 diff。
    const normalized = [...new Set(next)];
    innerKeys.value = normalized;
    setExpandedKeys(normalized);
  }

  function isExpanded(id: string) {
    return keySet.value.has(id);
  }

  function toggle(id: string) {
    const next = new Set(keySet.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    apply([...next]);
  }

  function setKeys(keys: string[]) {
    apply(keys);
  }

  /** 仅替换内部集合、不广播：供宿主通过 ref 受控写入时同步非受控镜像。 */
  function markKeys(keys: string[]) {
    innerKeys.value = [...new Set(keys)];
  }

  return {
    mergedKeys,
    isExpanded,
    toggle,
    setKeys,
    markKeys,
  };
}
