import type { ComputedRef } from "vue";

import { computed, ref, watch } from "vue";

export type CollapsibleOptions = {
  /**
   * @desc 初始化展开的节点
   * @descEN default expanded keys
   */
  defaultExpandedKeys?: string[];

  /**
   * @desc 当前展开的节点
   * @descEN current expanded keys
   */
  expandedKeys?: string[];

  /**
   * @desc 展开节点变化回调
   * @descEN callback when expanded keys change
   */
  onExpand?: (expandedKeys: string[]) => void;
};

type UseCollapsible = boolean | CollapsibleOptions;
type RequiredCollapsibleOptions = Required<CollapsibleOptions>;

const baseConfig: RequiredCollapsibleOptions = {
  expandedKeys: [],
  defaultExpandedKeys: [],
  onExpand: () => {},
};

export default function useCollapsible(
  collapsible: ComputedRef<UseCollapsible | undefined>,
) {
  const isUncontrolled = computed(() => {
    return (
      typeof collapsible.value === "boolean" ||
      collapsible.value?.expandedKeys === undefined
    );
  });

  const mergedConfig = computed(() => {
    if (!collapsible.value) {
      return {
        enableCollapse: false,
        ...baseConfig,
      };
    }

    if (typeof collapsible.value === "object") {
      return {
        enableCollapse: true,
        ...baseConfig,
        ...collapsible.value,
      };
    }

    return {
      enableCollapse: true,
      ...baseConfig,
    };
  });

  const innerExpandedKeys = ref<string[]>([]);

  watch(
    [() => mergedConfig.value.defaultExpandedKeys, isUncontrolled],
    ([defaultExpandedKeys, uncontrolled]) => {
      if (uncontrolled)
        innerExpandedKeys.value = [...(defaultExpandedKeys ?? [])];
    },
    { immediate: true },
  );

  const expandedKeys = computed(() => {
    if (isUncontrolled.value) return innerExpandedKeys.value;
    return mergedConfig.value.expandedKeys ?? [];
  });

  const onItemExpand = (curKey: string) => {
    const currentKeys = expandedKeys.value;
    const targetKeys = currentKeys.includes(curKey)
      ? currentKeys.filter(key => key !== curKey)
      : [...currentKeys, curKey];

    if (isUncontrolled.value) innerExpandedKeys.value = targetKeys;

    mergedConfig.value.onExpand?.(targetKeys);
    return targetKeys;
  };

  return {
    enableCollapse: computed(() => mergedConfig.value.enableCollapse),
    expandedKeys,
    onItemExpand: computed(() =>
      mergedConfig.value.enableCollapse ? onItemExpand : undefined,
    ),
  };
}
