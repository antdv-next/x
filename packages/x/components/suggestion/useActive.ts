import type { Ref } from "vue";

import { ref, watch } from "vue";

interface ActiveItem {
  value: string;
  children?: ActiveItem[];
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
      case "Enter":
        event.preventDefault();
        return false;
      case "Escape":
        onCancel();
        event.preventDefault();
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

  return [activePaths, onKeyDown] as const;
}
