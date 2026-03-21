import type { PropType } from "vue";

import { computed, defineComponent } from "vue";

import type { CreationProps } from "./interface";

import useCreation from "./hooks/useCreation";

const Creation = defineComponent({
  name: "XConversationsCreation",
  props: {
    label: {
      type: [String, Number, Object, Function] as PropType<
        CreationProps["label"]
      >,
      default: undefined,
    },
    align: {
      type: String as PropType<CreationProps["align"]>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: "antd-conversations-creation",
    },
    classes: {
      type: [String, Array, Object] as PropType<CreationProps["classes"]>,
      default: undefined,
    },
    style: {
      type: Object as PropType<CreationProps["style"]>,
      default: undefined,
    },
    shortcutKeyInfo: {
      type: Object as PropType<CreationProps["shortcutKeyInfo"]>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: [String, Number, Object, Function] as PropType<
        CreationProps["icon"]
      >,
      default: undefined,
    },
    onClick: {
      type: Function as PropType<CreationProps["onClick"]>,
      default: undefined,
    },
  },
  setup(props) {
    const mergedConfig = computed(() => {
      return useCreation({
        icon: props.icon,
        label: props.label,
        align: props.align,
        shortcutKeyInfo: props.shortcutKeyInfo,
        prefixCls: props.prefixCls,
      });
    });

    return () => {
      const [iconNode, labelNode, mergeAlign] = mergedConfig.value;

      return (
        <button
          type="button"
          onClick={event => {
            if (props.disabled) return;

            props.onClick?.(event as MouseEvent);
          }}
          style={props.style}
          class={[
            props.prefixCls,
            props.classes,
            `${props.prefixCls}-${mergeAlign}`,
            {
              [`${props.prefixCls}-disabled`]: props.disabled,
            },
          ]}
        >
          {iconNode}
          {labelNode}
        </button>
      );
    };
  },
});

export default Creation;
