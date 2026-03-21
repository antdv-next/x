import type { PropType } from "vue";

import { EllipsisOutlined } from "@antdv-next/icons";
import { Dropdown, Typography } from "antdv-next";
import { computed, defineComponent } from "vue";

import type {
  ConversationItemType,
  ConversationsItemMenu,
  ConversationsProps,
} from "./interface";

export interface ConversationsItemProps {
  info: ConversationItemType;
  prefixCls?: string;
  direction?: "ltr" | "rtl";
  menu?: ConversationsItemMenu;
  active?: boolean;
  classes?: any;
  style?: any;
  onClick?: ConversationsProps["onActiveChange"];
}

const stopPropagation = (event: Event) => {
  event.stopPropagation();
};

const ConversationsItem = defineComponent({
  name: "XConversationsItem",
  inheritAttrs: false,
  props: {
    info: {
      type: Object as PropType<ConversationItemType>,
      required: true,
    },
    prefixCls: {
      type: String,
      default: "antd-conversations",
    },
    direction: {
      type: String as PropType<"ltr" | "rtl">,
      default: "ltr",
    },
    menu: {
      type: Object as PropType<ConversationsItemMenu>,
      default: undefined,
    },
    active: {
      type: Boolean,
      default: false,
    },
    classes: {
      type: [String, Array, Object] as PropType<
        ConversationsItemProps["classes"]
      >,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<
        ConversationsItemProps["style"]
      >,
      default: undefined,
    },
    onClick: {
      type: Function as PropType<ConversationsProps["onActiveChange"]>,
      default: undefined,
    },
  },
  setup(props) {
    const mergedClasses = computed(() => {
      const disabled = props.info.disabled;
      return [
        props.classes,
        `${props.prefixCls}-item`,
        {
          [`${props.prefixCls}-item-active`]: props.active && !disabled,
          [`${props.prefixCls}-item-disabled`]: disabled,
        },
      ];
    });

    const menuProps = computed(() => {
      if (!props.menu) return undefined;

      const { trigger: _trigger, ...other } = props.menu;
      return other;
    });

    const renderMenuTrigger = (conversation: ConversationItemType) => {
      const originTriggerNode = (
        <EllipsisOutlined
          onClick={stopPropagation}
          class={`${props.prefixCls}-menu-icon`}
        />
      );

      if (!props.menu?.trigger) return originTriggerNode;

      return typeof props.menu.trigger === "function"
        ? props.menu.trigger(conversation, { originNode: originTriggerNode })
        : props.menu.trigger;
    };

    return () => {
      const disabled = props.info.disabled;

      return (
        <li
          title={
            typeof props.info.label === "string" ? props.info.label : undefined
          }
          class={mergedClasses.value}
          style={props.style}
          onClick={() => {
            if (!disabled) props.onClick?.(props.info.key, props.info);
          }}
        >
          {props.info.icon && (
            <div class={`${props.prefixCls}-icon`}>{props.info.icon}</div>
          )}
          <Typography.Text class={`${props.prefixCls}-label`}>
            {props.info.label}
          </Typography.Text>
          {!disabled && props.menu && (
            <div onClick={stopPropagation}>
              <Dropdown
                menu={menuProps.value}
                placement={
                  props.direction === "rtl" ? "bottomLeft" : "bottomRight"
                }
                trigger={["click"]}
                disabled={disabled}
                getPopupContainer={menuProps.value?.getPopupContainer}
              >
                {renderMenuTrigger(props.info)}
              </Dropdown>
            </div>
          )}
        </li>
      );
    };
  },
});

export default ConversationsItem;
