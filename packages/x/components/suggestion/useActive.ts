import type { Ref } from "vue";

import { ref, watch } from "vue";

interface ActiveItem {
  value: string;
  children?: ActiveItem[];
}

/**
 * An Enter pressed with a modifier or while an IME is composing belongs to the trigger
 * (submit, newline, candidate confirmation), never to the suggestion list.
 */
function isPlainEnter(event: KeyboardEvent) {
  return (
    !event.isComposing &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey
  );
}

/**
 * Cascader does not expose active item control, so we use `value` to mirror focus path.
 */
export default function useActive(
  items: Ref<ActiveItem[]>,
  open: Ref<boolean>,
  rtl: Ref<boolean>,
  onCancel: () => void,
) {
  const activePaths = ref<string[]>([]);

  const getItems = (columnIndex: number, paths = activePaths.value) => {
    let currentItems = items.value;

    for (let i = 0; i < columnIndex - 1; i += 1) {
      const activePath = paths[i];
      const activeItem = currentItems.find(item => item.value === activePath);
      if (!activeItem) break;
      currentItems = activeItem.children || [];
    }

    return currentItems;
  };

  const offsetRow = (offset: number) => {
    const currentColumnIndex = activePaths.value.length || 1;
    const currentItems = getItems(currentColumnIndex);
    const itemCount = currentItems.length;

    if (!itemCount) return;

    const currentRowIndex = currentItems.findIndex(
      item => item.value === activePaths.value[currentColumnIndex - 1],
    );

    const nextItem =
      currentItems[(currentRowIndex + offset + itemCount) % itemCount];
    if (!nextItem) return;

    activePaths.value = [
      ...activePaths.value.slice(0, currentColumnIndex - 1),
      nextItem.value,
    ];
  };

  const offsetPrev = () => {
    if (activePaths.value.length > 1) {
      activePaths.value = activePaths.value.slice(
        0,
        activePaths.value.length - 1,
      );
    }
  };

  const offsetNext = () => {
    const nextItems = getItems(activePaths.value.length + 1);
    const firstItem = nextItems[0];

    if (firstItem) {
      activePaths.value = [...activePaths.value, firstItem.value];
    }
  };

  const getActiveItem = () => {
    let currentItems = items.value;
    let activeItem: ActiveItem | undefined;

    for (const activePath of activePaths.value) {
      activeItem = currentItems.find(item => item.value === activePath);
      if (!activeItem) return undefined;
      currentItems = activeItem.children || [];
    }

    return activeItem;
  };

  /**
   * Whether this Enter belongs to the popup: it needs an open popup, a plain Enter and a
   * leaf item to select. Anything else stays with the trigger, so the input can still
   * submit, insert a newline or confirm an IME candidate.
   */
  const shouldSelectOnEnter = (event: KeyboardEvent) => {
    if (!open.value || !isPlainEnter(event)) return false;

    const activeItem = getActiveItem();
    return !!activeItem && !activeItem.children?.length;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open.value) return;

    switch (event.key) {
      case "ArrowDown":
        offsetRow(1);
        event.preventDefault();
        event.stopPropagation();
        break;
      case "ArrowUp":
        offsetRow(-1);
        event.preventDefault();
        event.stopPropagation();
        break;
      case "ArrowRight":
        if (rtl.value) {
          offsetPrev();
        } else {
          offsetNext();
        }
        event.preventDefault();
        event.stopPropagation();
        break;
      case "ArrowLeft":
        if (rtl.value) {
          offsetNext();
        } else {
          offsetPrev();
        }
        event.preventDefault();
        event.stopPropagation();
        break;
      case "Enter": {
        if (!isPlainEnter(event)) break;

        const activeItem = getActiveItem();
        // Nothing to act on (empty list): let the trigger keep the key.
        if (!activeItem) break;

        event.preventDefault();

        // A parent item cannot be selected, so Enter expands it like ArrowRight does.
        if (activeItem.children?.length) {
          offsetNext();
          event.stopPropagation();
        }

        return false;
      }
      case "Escape":
        onCancel();
        event.preventDefault();
        event.stopPropagation();
        break;
      default:
        break;
    }
  };

  watch(
    [open, items],
    ([nextOpen, nextItems]) => {
      if (nextOpen && Array.isArray(nextItems) && nextItems.length > 0) {
        activePaths.value = [nextItems[0]!.value];
      }
    },
    { immediate: true },
  );

  return [activePaths, onKeyDown, shouldSelectOnEnter] as const;
}
