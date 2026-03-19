import type { PropType, StyleValue } from "vue";

import { defineComponent, ref } from "vue";

import type {
  BubbleContentType,
  BubbleRef,
  SystemBubbleProps,
} from "./interface";

import Bubble from "./Bubble";

export const XBubbleSystem = defineComponent({
  name: "XBubbleSystem",
  props: {
    prefixCls: {
      type: String,
      default: "antd-bubble",
    },
    content: {
      type: [String, Number, Object, Array] as PropType<BubbleContentType>,
      required: true,
    },
    variant: {
      type: String as PropType<"filled" | "outlined" | "shadow" | "borderless">,
      default: "shadow",
    },
    shape: {
      type: String as PropType<"default" | "round" | "corner">,
      default: "default",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    class: {
      type: [String, Array, Object] as PropType<SystemBubbleProps["class"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<SystemBubbleProps["styles"]>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<SystemBubbleProps["classes"]>,
      default: () => ({}),
    },
    rootClass: {
      type: String,
      default: "",
    },
  },
  setup(props, { expose, attrs }) {
    const bubbleRef = ref<BubbleRef>();

    expose<BubbleRef>({
      get nativeElement() {
        return bubbleRef.value?.nativeElement as HTMLDivElement;
      },
    });

    return () => (
      <Bubble
        ref={bubbleRef}
        {...attrs}
        prefixCls={props.prefixCls}
        content={props.content}
        variant={props.variant}
        shape={props.shape}
        rootClass={props.rootClass}
        style={props.style}
        class={[`${props.prefixCls}-system`, props.class]}
        styles={props.styles}
        classes={props.classes}
      />
    );
  },
});

export default XBubbleSystem;
