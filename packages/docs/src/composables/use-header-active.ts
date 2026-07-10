import { computed } from "vue";
import { useRoute } from "vue-router";

import { type HeaderItem, headerItems } from "@/config/header";

/**
 * 根据当前路由解析顶栏激活的导航项。
 *
 * 不同模块（Components / Markdown / Card / SDK / Skill）对应不同的子包，
 * 其 `version` 字段用于顶栏右侧的版本切换器展示当前模块版本，
 * 并为后续多版本列表（versionList）切换做铺垫。
 */
export function useActiveHeaderItem() {
  const route = useRoute();

  const activeItem = computed<HeaderItem | undefined>(() =>
    headerItems.find(item => route.path.includes(item.basePath)),
  );

  const activeKey = computed(() => activeItem.value?.key);

  const activeVersion = computed(() => activeItem.value?.version);

  return { activeItem, activeKey, activeVersion };
}
