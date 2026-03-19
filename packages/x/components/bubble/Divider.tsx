import type { PropType, StyleValue } from "vue";

import { Divider } from "antdv-next";
import { defineComponent, ref } from "vue";

import type {
  BubbleContentType,
  BubbleRef,
  DividerBubbleProps,
} from "./interface";

import Bubble from "./Bubble";

export const XBubbleDivider = defineComponent({
  name: "XBubbleDivider",
  props: {
    prefixCls: {
      type: String,
      default: "antd-bubble",
    },
    content: {
      type: [String, Number, Object, Array] as PropType<BubbleContentType>,
      default: "",
    },
    rootClass: {
      type: String,
      default: "",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    class: {
      type: [String, Array, Object] as PropType<DividerBubbleProps["class"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<DividerBubbleProps["styles"]>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<DividerBubbleProps["classes"]>,
      default: () => ({}),
    },
    dividerProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
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
        variant="borderless"
        rootClass={props.rootClass}
        style={props.style}
        class={[`${props.prefixCls}-divider`, props.class]}
        styles={props.styles}
        classes={props.classes}
        contentRender={content => (
          <Divider {...props.dividerProps}>{content}</Divider>
        )}
      />
    );
  },
});

export default XBubbleDivider;
