import type {
  ClassValue,
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import { Typography } from "antdv-next";
import { computed, defineComponent, useAttrs } from "vue";

import useActionsStyle from "./style";

type SemanticType = "root";

export interface ActionsCopyProps {
  text?: string;
  icon?: VNodeChild;
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
}

export const XActionsCopy = defineComponent({
  name: "XActionsCopy",
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      default: "",
    },
    icon: {
      type: [String, Number, Object, Array, Function] as PropType<VNodeChild>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: "antd-actions",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const [hashId, cssVarCls] = useActionsStyle(
      computed(() => props.prefixCls),
    );
    const copyCls = `${props.prefixCls}-copy`;

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    return () => (
      <Typography.Text
        {...domAttrs.value}
        class={[
          props.prefixCls,
          copyCls,
          `${props.prefixCls}-item`,
          hashId.value,
          cssVarCls.value,
          props.rootClass,
          props.classes?.root,
          attrs.class,
          props.class,
        ]}
        style={[props.styles?.root, attrs.style as StyleValue, props.style]}
        prefixCls={copyCls}
        copyable={{
          text: props.text,
          icon: props.icon as any,
        }}
      />
    );
  },
});

export default XActionsCopy;
