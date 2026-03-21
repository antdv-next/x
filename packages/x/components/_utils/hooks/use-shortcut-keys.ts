import type { ComputedRef, MaybeRef, Ref } from "vue";

import { KeyCode } from "@v-c/util";
import { computed, onBeforeUnmount, ref, shallowRef, unref, watch } from "vue";

import type { XComponentsConfig } from "../../x-provider/context";
import type { CodeKeyType, PrefixKeysType, ShortcutKeys } from "../type";

import useXComponentConfig from "./use-x-component-config";

export type ShortcutKeyActionType = {
  actionShortcutKey: ShortcutKeys<number>;
  actionKeyCode: number;
  name: string;
  timeStamp: number;
  actionKeyCodeNumber: number | false;
  index?: number;
};

export type ShortcutKeyInfoType = {
  shortcutKeys: ShortcutKeys | ShortcutKeys[];
  shortcutKeysIcon: string[] | string[][];
};

type ShortcutKeysInfo = Record<string, ShortcutKeyInfoType>;

type FlattenShortcutKeysType = {
  name: string;
  shortcutKey: ShortcutKeys<number>;
  index?: number;
}[];

type Observer = (shortcutKeyAction: ShortcutKeyActionType) => void;
type Subscribe = (fn: Observer) => void;

interface UseShortcutKeysOptions {
  shouldIgnore?: (event: KeyboardEvent) => boolean;
}

const PrefixKeys: PrefixKeysType = {
  Alt: ["altKey", "Alt", "Alt"],
  Ctrl: ["ctrlKey", "Ctrl", "Ctrl"],
  Meta: ["metaKey", "Cmd", "Win"],
  Shift: ["shiftKey", "Shift", "Shift"],
};

const NumberKeyCode: number[] = Array.from(
  { length: 9 },
  (_, i) => KeyCode.ONE + i,
);

const isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(
  typeof navigator !== "undefined" ? navigator?.platform : "",
);

const KeyCodeNameMap: Record<number, string> = {
  [KeyCode.BACKSPACE]: "Backspace",
  [KeyCode.TAB]: "Tab",
  [KeyCode.ENTER]: "Enter",
  [KeyCode.ESC]: "Esc",
  [KeyCode.SPACE]: "Space",
  [KeyCode.DELETE]: "Delete",
};

const getShortcutKeysIcon = (key: CodeKeyType): string => {
  if (key === "number") return key;

  if (typeof key === "string" && PrefixKeys?.[key]?.[isAppleDevice ? 1 : 2])
    return PrefixKeys[key][isAppleDevice ? 1 : 2];

  if (typeof key === "number") {
    if (key >= KeyCode.A && key <= KeyCode.Z) return String.fromCharCode(key);
    if (key >= KeyCode.ZERO && key <= KeyCode.NINE)
      return String.fromCharCode(key);

    return KeyCodeNameMap[key] ?? "";
  }

  return "";
};

function getShortcutAction(
  shortcutKey: ShortcutKeys<number>,
  event: KeyboardEvent,
): false | Omit<ShortcutKeyActionType, "name" | "index"> {
  const copyShortcutKey = [...shortcutKey];
  const keyCode = copyShortcutKey.pop();
  const signKeys = copyShortcutKey as (keyof PrefixKeysType)[];

  const hitKey = signKeys.reduce((value, signKey) => {
    if (!value) return value;

    return (event[PrefixKeys?.[signKey]?.[0]] as boolean) || false;
  }, keyCode === event.keyCode);

  if (!hitKey) return false;

  return {
    actionShortcutKey: shortcutKey,
    actionKeyCodeNumber:
      NumberKeyCode.indexOf(event.keyCode) > -1
        ? NumberKeyCode.indexOf(event.keyCode)
        : false,
    actionKeyCode: event.keyCode,
    timeStamp: event.timeStamp,
  };
}

function getDecomposedShortcutKeys(shortcutKeys: ShortcutKeys): {
  prefixKeys: (keyof PrefixKeysType)[];
  keyCodeDict: number[];
} {
  const copyShortcutKey = [...shortcutKeys];
  const keyCode = copyShortcutKey.pop() as number | "number";
  const prefixKeys = copyShortcutKey as (keyof PrefixKeysType)[];
  const keyCodeDict = keyCode === "number" ? NumberKeyCode : [keyCode];

  return {
    keyCodeDict,
    prefixKeys,
  };
}

function getFlattenShortcutKeys(
  contextShortcutKeys: Record<string, ShortcutKeys | ShortcutKeys[]>,
  componentShortcutKeys?: Record<string, ShortcutKeys | ShortcutKeys[]>,
): {
  flattenShortcutKeys: FlattenShortcutKeysType;
  shortcutKeysInfo: ShortcutKeysInfo;
} {
  const mergeShortcutKeys = Object.assign(
    {},
    contextShortcutKeys || {},
    componentShortcutKeys,
  );

  return Object.keys(mergeShortcutKeys).reduce(
    ({ flattenShortcutKeys, shortcutKeysInfo }, subName) => {
      const subShortcutKeys = mergeShortcutKeys[subName];

      if (!Array.isArray(subShortcutKeys))
        return { flattenShortcutKeys, shortcutKeysInfo };

      const subShortcutInfo: ShortcutKeyInfoType = {
        shortcutKeys: subShortcutKeys,
        shortcutKeysIcon: [],
      };

      shortcutKeysInfo = {
        ...shortcutKeysInfo,
        [subName]: subShortcutInfo,
      };

      if (subShortcutKeys.every(item => Array.isArray(item))) {
        subShortcutKeys.forEach((shortcutKey, index) => {
          const shortcutKeyArr = shortcutKey as ShortcutKeys<number>;

          flattenShortcutKeys.push({
            name: subName,
            shortcutKey: shortcutKeyArr,
            index,
          });

          (subShortcutInfo.shortcutKeysIcon as string[][]).push(
            shortcutKeyArr.map(key => getShortcutKeysIcon(key)),
          );
        });
      } else {
        const { keyCodeDict, prefixKeys } = getDecomposedShortcutKeys(
          subShortcutKeys as ShortcutKeys,
        );

        keyCodeDict.forEach(keyCode => {
          flattenShortcutKeys.push({
            name: subName,
            shortcutKey: [...prefixKeys, keyCode] as ShortcutKeys<number>,
          });
        });

        subShortcutInfo.shortcutKeysIcon = (
          subShortcutKeys as ShortcutKeys
        ).map(key => getShortcutKeysIcon(key as CodeKeyType));
      }

      return { flattenShortcutKeys, shortcutKeysInfo };
    },
    {
      flattenShortcutKeys: [] as FlattenShortcutKeysType,
      shortcutKeysInfo: {} as ShortcutKeysInfo,
    },
  );
}

export default function useShortcutKeys(
  component: keyof XComponentsConfig,
  shortcutKeys?: MaybeRef<
    Record<string, ShortcutKeys | ShortcutKeys[]> | undefined
  >,
  options?: UseShortcutKeysOptions,
): [
  Ref<ShortcutKeyActionType | null>,
  ComputedRef<ShortcutKeysInfo>,
  Subscribe,
] {
  const contextConfig = useXComponentConfig(component);
  const shortcutAction = ref<ShortcutKeyActionType | null>(null);
  const observer = shallowRef<Observer>();
  const keyLockRef = ref(false);

  const flattenShortcutResult = computed(() =>
    getFlattenShortcutKeys(
      (contextConfig.value.shortcutKeys ?? {}) as Record<
        string,
        ShortcutKeys | ShortcutKeys[]
      >,
      unref(shortcutKeys),
    ),
  );

  const shortcutKeysInfo = computed(
    () => flattenShortcutResult.value.shortcutKeysInfo,
  );

  const subscribe = (fn: Observer) => {
    observer.value = fn;
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (keyLockRef.value || options?.shouldIgnore?.(event)) return;

    for (const shortcutKeyInfo of flattenShortcutResult.value
      .flattenShortcutKeys) {
      const activeKeyInfo = getShortcutAction(
        shortcutKeyInfo.shortcutKey,
        event,
      );
      if (!activeKeyInfo) continue;

      const info = {
        ...activeKeyInfo,
        name: shortcutKeyInfo.name,
        index: shortcutKeyInfo.index,
      };

      keyLockRef.value = true;
      shortcutAction.value = info;
      observer.value?.(info);
      return;
    }
  };

  const onKeyup = () => {
    keyLockRef.value = false;
  };

  watch(
    () => flattenShortcutResult.value.flattenShortcutKeys.length,
    length => {
      if (typeof document === "undefined") return;

      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("keyup", onKeyup);

      if (length > 0) {
        document.addEventListener("keydown", onKeydown);
        document.addEventListener("keyup", onKeyup);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (typeof document === "undefined") return;

    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("keyup", onKeyup);
  });

  return [shortcutAction, shortcutKeysInfo, subscribe];
}

export { getShortcutKeysIcon };
