import type { PropType } from "vue";

import { Tooltip } from "antdv-next";
import { computed, defineComponent } from "vue";

import type {
  ActionsItemProps,
  ActionsProps,
  ItemType,
  SemanticType,
} from "./interface";

import ActionsMenu from "./ActionsMenu";

let keySeed = 0;

const Item = defineComponent({
  name: "XActionsActionItem",
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
    const fallbackKey = `actions-item-${++keySeed}`;

    const itemKey = computed(() => {
      if (props.item?.key === undefined || props.item?.key === null)
        return fallbackKey;
      return String(props.item.key);
    });

    const onItemClick = (domEvent: MouseEvent) => {
      if (props.item.onItemClick) {
        props.item.onItemClick(props.item);
        return;
      }

      props.onClick?.({
        key: itemKey.value,
        item: props.item,
        keyPath: [itemKey.value],
        domEvent,
      });
    };

    return () => {
      if (!props.item) return null;

      if (props.item.actionRender !== undefined) {
        return typeof props.item.actionRender === "function"
          ? props.item.actionRender(props.item)
          : props.item.actionRender;
      }

      if (props.item.subItems?.length) {
        return (
          <ActionsMenu
            item={props.item}
            onClick={props.onClick}
            dropdownProps={props.dropdownProps}
            prefixCls={props.prefixCls}
            classes={props.classes}
            styles={props.styles}
          />
        );
      }

      return (
        <div
          class={[
            `${props.prefixCls}-item`,
            props.classes?.item,
            {
              [`${props.prefixCls}-list-danger`]: props.item?.danger,
            },
          ]}
          style={props.styles?.item}
          onClick={onItemClick}
        >
          <Tooltip title={props.item.label}>
            <div class={`${props.prefixCls}-icon`}>{props.item?.icon}</div>
          </Tooltip>
        </div>
      );
    };
  },
});

export default Item;

export type { ActionsItemProps };
