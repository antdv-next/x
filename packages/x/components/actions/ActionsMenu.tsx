import type { MenuProps } from "antdv-next";
import type { PropType } from "vue";

import { EllipsisOutlined } from "@antdv-next/icons";
import { Dropdown } from "antdv-next";
import { computed, defineComponent } from "vue";

import type { ActionsProps, ItemType, SemanticType } from "./interface";

let keySeed = 0;

export function findItem(
  keyPath: string[],
  items: ItemType[],
): ItemType | null {
  const keyToFind = keyPath[0];
  for (const item of items) {
    if (!item) return null;
    if (String(item.key) === keyToFind) {
      if (keyPath.length === 1) return item;

      if (item.subItems?.length)
        return findItem(keyPath.slice(1), item.subItems);
    }
  }

  return null;
}

const ActionsMenu = defineComponent({
  name: "XActionsMenu",
  props: {
    item: {
      type: Object as PropType<ItemType>,
      required: true,
    },
    onClick: {
      type: Function as PropType<ActionsProps["onClick"]>,
      default: undefined,
    },
    dropdownProps: {
      type: Object as PropType<ActionsProps["dropdownProps"]>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: "antd-actions",
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<ActionsProps["styles"]>,
      default: () => ({}),
    },
  },
  setup(props) {
    const fallbackKey = `actions-menu-${++keySeed}`;

    const itemKey = computed(() => {
      if (props.item?.key === undefined || props.item?.key === null)
        return fallbackKey;
      return String(props.item.key);
    });

    const mergedDropdownStyles = computed(() => {
      const mergedPropsStyles = props.dropdownProps?.styles;
      if (typeof mergedPropsStyles === "function") return mergedPropsStyles;

      return {
        ...(mergedPropsStyles as Record<string, any> | undefined),
        root: {
          ...props.styles?.itemDropdown,
          ...(mergedPropsStyles as Record<string, any> | undefined)?.root,
        },
      };
    });

    const menuProps = computed(() => {
      const subItems = props.item.subItems ?? [];

      return {
        items: subItems as MenuProps["items"],
        triggerSubMenuAction: props.item.triggerSubMenuAction ?? "hover",
        onClick: (info: any) => {
          const keyPath = (info?.keyPath ?? []).map((key: string | number) =>
            String(key),
          );
          const currentItem = findItem(keyPath, subItems);

          if (currentItem?.onItemClick) {
            currentItem.onItemClick(currentItem);
            return;
          }

          props.onClick?.({
            key: String(info.key),
            keyPath: [...keyPath, itemKey.value],
            domEvent: info.domEvent as Event,
            item: currentItem ?? props.item,
          });
        },
      };
    });

    return () => (
      <Dropdown
        menu={menuProps.value}
        trigger={[props.item.triggerSubMenuAction ?? "hover"]}
        {...props.dropdownProps}
        class={[
          `${props.prefixCls}-dropdown`,
          props.classes?.itemDropdown,
          (props.dropdownProps?.classes as any)?.root,
        ]}
        styles={mergedDropdownStyles.value}
      >
        <div
          class={[
            `${props.prefixCls}-item`,
            `${props.prefixCls}-sub-item`,
            props.classes?.item,
          ]}
          style={props.styles?.item}
        >
          <div class={`${props.prefixCls}-icon`}>
            {props.item?.icon ?? <EllipsisOutlined />}
          </div>
        </div>
      </Dropdown>
    );
  },
});

export default ActionsMenu;
