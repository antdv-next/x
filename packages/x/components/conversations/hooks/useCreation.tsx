import { PlusOutlined } from "@antdv-next/icons";
import { defineComponent } from "vue";

import type {
  CodeKeyType,
  CreationLabelProps,
  CreationProps,
  PrefixKeysType,
} from "../interface";

import { useLocale } from "../../locale";

const PrefixKeys: PrefixKeysType = {
  Alt: ["altKey", "Alt", "Alt"],
  Ctrl: ["ctrlKey", "Ctrl", "Ctrl"],
  Meta: ["metaKey", "Cmd", "Win"],
  Shift: ["shiftKey", "Shift", "Shift"],
};

const isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(
  typeof navigator !== "undefined" ? navigator?.platform : "",
);

const KeyCodeMap: Record<number, string> = {
  8: "Backspace",
  9: "Tab",
  13: "Enter",
  27: "Esc",
  32: "Space",
  46: "Delete",
};

function getShortcutKeysIcon(key: CodeKeyType): string {
  if (key === "number") return key;

  if (typeof key === "string" && PrefixKeys[key])
    return PrefixKeys[key][isAppleDevice ? 1 : 2];

  if (typeof key === "number") {
    if (key >= 65 && key <= 90) return String.fromCharCode(key);

    if (key >= 48 && key <= 57) return String.fromCharCode(key);

    if (KeyCodeMap[key]) return KeyCodeMap[key];
  }

  return "";
}

export const CreationLabel = defineComponent<CreationLabelProps>({
  name: "XConversationsCreationLabel",
  props: {
    shortcutKeysIcon: {
      type: Array as () => string[] | undefined,
      default: undefined,
    },
    prefixCls: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const [locale] = useLocale("Conversations");

    return () => {
      const showShortcutKeys = !!props.shortcutKeysIcon?.length;

      return (
        <div
          class={[
            props.prefixCls,
            { [`${props.prefixCls}-shortcut-keys-show`]: showShortcutKeys },
          ]}
        >
          <span>{locale.value.create}</span>
          {showShortcutKeys && (
            <span class={`${props.prefixCls}-shortcut-keys`}>
              {props.shortcutKeysIcon?.map(keyIcon => (
                <span class={`${props.prefixCls}-shortcut-key`} key={keyIcon}>
                  {keyIcon}
                </span>
              ))}
            </span>
          )}
        </div>
      );
    };
  },
});

interface BaseConfig {
  label: any;
  icon: any;
  align: CreationProps["align"];
}

export default function useCreation({
  icon,
  label,
  align,
  shortcutKeyInfo,
  prefixCls,
}: Pick<
  CreationProps,
  "label" | "icon" | "align" | "shortcutKeyInfo" | "prefixCls"
>): [any, any, CreationProps["align"]] {
  const shortcutKeysIcon = shortcutKeyInfo?.shortcutKeysIcon as
    | string[]
    | undefined;

  const creationConfig: BaseConfig = {
    label: (
      <CreationLabel
        prefixCls={`${prefixCls}-label`}
        shortcutKeysIcon={shortcutKeysIcon}
      />
    ),
    icon: <PlusOutlined class={`${prefixCls}-icon`} />,
    align: "center",
  };

  if (label) {
    creationConfig.label =
      typeof label === "function"
        ? label({
            shortcutKeyInfo,
            components: {
              CreationLabel: (props: CreationLabelProps) => (
                <CreationLabel {...props} />
              ),
            },
          })
        : label;
  }

  if (icon) creationConfig.icon = typeof icon === "function" ? icon() : icon;

  return [
    creationConfig.icon,
    creationConfig.label,
    align || creationConfig.align,
  ];
}

export { getShortcutKeysIcon };
