import type { Ref, ShallowRef } from "vue";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";

import type { MessageScrollerItem } from "../types";

import {
  DEFAULT_RAIL_ITEM_HEIGHT,
  MIN_RAIL_ITEM_HEIGHT,
  RAIL_INSET,
} from "../style/token";
import {
  PROGRAMMATIC_SCROLL_WINDOW,
  resolveElementPreview,
  resolveItemId,
} from "../utils";

export interface MessageScrollerRailEntry {
  id: string;
  index: number;
  element: HTMLElement;
  item: MessageScrollerItem;
}

export interface MessageScrollerRailOptions {
  rail: ShallowRef<HTMLElement | undefined>;
  viewport: ShallowRef<HTMLElement | undefined>;
  content: ShallowRef<HTMLElement | undefined>;
  enabled: Ref<boolean>;
  items: Ref<MessageScrollerItem[]>;
  itemSelector: Ref<string>;
  threshold: Ref<number>;
}

function isSameEntries(
  current: MessageScrollerRailEntry[],
  next: MessageScrollerRailEntry[],
) {
  return (
    current.length === next.length &&
    current.every((entry, index) => {
      const candidate = next[index];
      return (
        candidate !== undefined &&
        entry.id === candidate.id &&
        entry.element === candidate.element &&
        entry.item === candidate.item
      );
    })
  );
}

/**
 * 消息导航导轨：扫描消息节点、跟踪当前项，并维护悬停 / 触屏锁定 / 焦点的激活优先级。
 */
export function useMessageScrollerRail(options: MessageScrollerRailOptions) {
  const { rail, viewport, content, enabled, items, itemSelector, threshold } =
    options;

  const entries = shallowRef<MessageScrollerRailEntry[]>([]);
  const activeId = ref("");
  const hoveredId = ref<string>();
  const pinnedId = ref<string>();
  const focusedId = ref<string>();
  const overflowing = ref(false);
  const viewportHeight = ref(0);

  /**
   * 显式选中的刻度的占位窗口：点击已经发出平滑滚动，位置判定要等它落位再接管。
   */
  let selectionLockUntil = 0;

  /**
   * 预览卡片的激活优先级：`hovered ?? pinned ?? focused`。
   *
   * 滚动定位出的当前项只点亮刻度，不弹出卡片，避免阅读时预览持续跟随。
   */
  const cardId = computed(
    () => hoveredId.value ?? pinnedId.value ?? focusedId.value ?? "",
  );
  /** 刻度高亮优先级：显式激活优先，其次是滚动定位出的当前项。 */
  const highlightedId = computed(() => cardId.value || activeId.value);
  const cardIndex = computed(() =>
    entries.value.findIndex(entry => entry.id === cardId.value),
  );
  const highlightedIndex = computed(() =>
    entries.value.findIndex(entry => entry.id === highlightedId.value),
  );
  const visible = computed(() => enabled.value && overflowing.value);

  /**
   * 视口装不下全部刻度时均匀压缩单项高度，保证导轨始终落在视口内。
   */
  const itemHeight = computed(() => {
    const count = entries.value.length;
    const available = viewportHeight.value - RAIL_INSET * 2;
    if (!count || available <= 0) {
      return DEFAULT_RAIL_ITEM_HEIGHT;
    }

    return Math.min(
      DEFAULT_RAIL_ITEM_HEIGHT,
      Math.max(MIN_RAIL_ITEM_HEIGHT, Math.floor(available / count)),
    );
  });

  function resolveEntryItem(
    element: HTMLElement,
    id: string,
    index: number,
  ): MessageScrollerItem {
    const meta =
      items.value.find(item => String(item.id) === id) ?? items.value[index];
    if (meta?.title) {
      return meta;
    }

    const preview = resolveElementPreview(element);
    return {
      ...meta,
      id,
      title: meta?.title ?? preview.title,
      description: meta?.description ?? preview.description,
    };
  }

  function measure() {
    const viewportElement = viewport.value;
    if (!viewportElement) {
      overflowing.value = false;
      return;
    }

    viewportHeight.value = viewportElement.clientHeight;
    overflowing.value =
      entries.value.length > 1 &&
      viewportElement.scrollHeight > viewportElement.clientHeight + 1;
  }

  /**
   * 当前项判定：贴近首尾时直接取首尾，否则取视口中心最近的消息。
   *
   * 显式选中后的落位窗口内不改写激活项：此时滚动位置由点击发出，位置判定尚未代表读者意图。
   */
  function updateActive() {
    const viewportElement = viewport.value;
    const list = entries.value;
    const first = list[0];
    const last = list[list.length - 1];
    if (!viewportElement || !first || !last) {
      activeId.value = "";
      return;
    }

    if (performance.now() < selectionLockUntil) {
      return;
    }

    if (viewportElement.scrollTop <= threshold.value) {
      activeId.value = first.id;
      return;
    }

    const distanceFromEnd =
      viewportElement.scrollHeight -
      viewportElement.scrollTop -
      viewportElement.clientHeight;
    if (distanceFromEnd <= threshold.value) {
      activeId.value = last.id;
      return;
    }

    const viewportRect = viewportElement.getBoundingClientRect();
    const center = viewportRect.top + viewportRect.height / 2;
    let nearestId = first.id;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const entry of list) {
      const rect = entry.element.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = entry.id;
      }
    }

    activeId.value = nearestId;
  }

  function sync() {
    const contentElement = content.value;
    const viewportElement = viewport.value;
    if (!enabled.value || !contentElement || !viewportElement) {
      entries.value = [];
      activeId.value = "";
      overflowing.value = false;
      return;
    }

    const selector = itemSelector.value;
    const elements = Array.from(
      contentElement.querySelectorAll<HTMLElement>(selector),
    );
    const next = elements.map<MessageScrollerRailEntry>((element, index) => {
      const id = resolveItemId(element, index, selector);
      return { id, index, element, item: resolveEntryItem(element, id, index) };
    });

    if (!isSameEntries(entries.value, next)) {
      entries.value = next;
    }

    measure();
    updateActive();
  }

  let syncFrame: number | undefined;

  function scheduleSync() {
    if (syncFrame !== undefined) {
      window.cancelAnimationFrame(syncFrame);
    }
    syncFrame = window.requestAnimationFrame(() => {
      syncFrame = undefined;
      sync();
    });
  }

  function handleItemPointerEnter(id: string, event: PointerEvent) {
    if (event.pointerType !== "touch") {
      hoveredId.value = id;
    }
  }

  function handlePointerLeave() {
    hoveredId.value = undefined;
  }

  /**
   * 上一次按下手势的指针类型：触屏没有悬停，点击会点亮刻度并锁定预览卡片，直到点击导轨外才解除。
   */
  let activePointerType: string | undefined;

  function handleItemPointerDown(id: string, event: PointerEvent) {
    activePointerType = event.pointerType;
    focusedId.value = undefined;
    hoveredId.value = id;
  }

  /**
   * 点击刻度：先把激活项切到目标并锁住位置判定，直到这次平滑滚动落位。
   *
   * 视口贴近首尾时居中目标会被夹回边界，纯位置判定会把激活项算回首项；显式选中优先。
   */
  function handleItemClick(id: string) {
    selectionLockUntil = performance.now() + PROGRAMMATIC_SCROLL_WINDOW;
    activeId.value = id;

    if (activePointerType !== undefined && activePointerType !== "mouse") {
      pinnedId.value = id;
    }
    activePointerType = undefined;
  }

  function handleItemFocus(id: string, event: FocusEvent) {
    if ((event.currentTarget as HTMLElement).matches(":focus-visible")) {
      focusedId.value = id;
    }
  }

  function handleBlur(event: FocusEvent) {
    const current = event.currentTarget as HTMLElement;
    if (current.contains(event.relatedTarget as Node | null)) {
      return;
    }

    focusedId.value = undefined;
    pinnedId.value = undefined;
  }

  function handleDocumentPointerDown(event: PointerEvent) {
    const railElement = rail.value;
    if (
      railElement &&
      event.target instanceof Node &&
      railElement.contains(event.target)
    ) {
      return;
    }

    pinnedId.value = undefined;
  }

  watch(pinnedId, value => {
    if (value === undefined) {
      document.removeEventListener(
        "pointerdown",
        handleDocumentPointerDown,
        true,
      );
      return;
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown, true);
  });

  let mutationObserver: MutationObserver | undefined;
  let resizeObserver: ResizeObserver | undefined;

  function observe() {
    const contentElement = content.value;
    const viewportElement = viewport.value;
    if (!contentElement || !viewportElement || !enabled.value) {
      return;
    }

    mutationObserver = new MutationObserver(scheduleSync);
    mutationObserver.observe(contentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(contentElement);
    resizeObserver.observe(viewportElement);
  }

  function disconnect() {
    mutationObserver?.disconnect();
    mutationObserver = undefined;
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    if (syncFrame !== undefined) {
      window.cancelAnimationFrame(syncFrame);
      syncFrame = undefined;
    }
  }

  onMounted(() => {
    sync();
    observe();
  });

  watch(enabled, () => {
    disconnect();
    sync();
    observe();
  });

  watch([items, itemSelector], scheduleSync);

  onBeforeUnmount(() => {
    disconnect();
    document.removeEventListener(
      "pointerdown",
      handleDocumentPointerDown,
      true,
    );
  });

  return {
    entries,
    activeId,
    cardId,
    cardIndex,
    highlightedId,
    highlightedIndex,
    itemHeight,
    visible,
    sync,
    updateActive,
    handleItemClick,
    handleItemPointerEnter,
    handleItemPointerDown,
    handleItemFocus,
    handlePointerLeave,
    handleBlur,
  };
}
