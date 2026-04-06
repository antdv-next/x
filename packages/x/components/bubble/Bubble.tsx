import type { CSSProperties, PropType, StyleValue } from "vue";

import { computed, defineComponent, ref, toRefs, useAttrs, watch } from "vue";

import type {
  BubbleAnimationOption,
  BubbleContentType,
  BubbleProps,
  BubbleRef,
  BubbleSlot,
  EditableBubbleOption,
  Info,
  SemanticType,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { EditableContent } from "./EditableContent";
import Loading from "./loading";
import useBubbleStyle from "./style";
import { TypingContent } from "./TypingContent";

function renderBubbleSlot(
  slot: BubbleSlot<any> | undefined,
  content: any,
  info: Info,
) {
  if (!slot) return null;
  return typeof slot === "function" ? slot(content, info) : slot;
}

function hasRenderableNode(node: any): boolean {
  if (Array.isArray(node))
    return node.some(
      item => item !== null && item !== undefined && item !== false,
    );
  return node !== null && node !== undefined && node !== false;
}

export const XBubble = defineComponent({
  name: "AxBubble",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-bubble",
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
      type: [String, Array, Object] as PropType<BubbleProps["class"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    placement: {
      type: String as PropType<"start" | "end">,
      default: "start",
    },
    content: {
      type: [String, Number, Object, Array] as PropType<BubbleContentType>,
      required: true,
    },
    contentRender: {
      type: Function as PropType<BubbleProps["contentRender"]>,
      default: undefined,
    },
    editable: {
      type: [Boolean, Object] as PropType<boolean | EditableBubbleOption>,
      default: false,
    },
    typing: {
      type: [Boolean, Object, Function] as PropType<BubbleProps["typing"]>,
      default: false,
    },
    streaming: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String as PropType<"filled" | "outlined" | "shadow" | "borderless">,
      default: "filled",
    },
    shape: {
      type: String as PropType<"default" | "round" | "corner">,
      default: "default",
    },
    header: {
      type: [String, Number, Object, Array, Function] as PropType<
        BubbleProps["header"]
      >,
      default: undefined,
    },
    footer: {
      type: [String, Number, Object, Array, Function] as PropType<
        BubbleProps["footer"]
      >,
      default: undefined,
    },
    avatar: {
      type: [String, Number, Object, Array, Function] as PropType<
        BubbleProps["avatar"]
      >,
      default: undefined,
    },
    extra: {
      type: [String, Number, Object, Array, Function] as PropType<
        BubbleProps["extra"]
      >,
      default: undefined,
    },
    footerPlacement: {
      type: String as PropType<BubbleProps["footerPlacement"]>,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingRender: {
      type: Function as PropType<BubbleProps["loadingRender"]>,
      default: undefined,
    },
    onTyping: {
      type: Function as PropType<BubbleProps["onTyping"]>,
      default: undefined,
    },
    onTypingComplete: {
      type: Function as PropType<BubbleProps["onTypingComplete"]>,
      default: undefined,
    },
    onEditConfirm: {
      type: Function as PropType<BubbleProps["onEditConfirm"]>,
      default: undefined,
    },
    onEditCancel: {
      type: Function as PropType<BubbleProps["onEditCancel"]>,
      default: undefined,
    },
    info: {
      type: Object as PropType<Info>,
      default: () => ({}),
    },
  },
  setup(props, { expose, slots }) {
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("bubble");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useBubbleStyle(computed(() => props.prefixCls));

    expose<BubbleRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const memoedContent = computed(() => {
      if (slots.contentRender) {
        const slotNode = slots.contentRender({
          content: props.content,
          info: props.info,
        });
        if (hasRenderableNode(slotNode)) return slotNode;
      }

      return props.contentRender
        ? props.contentRender(props.content as never, props.info)
        : props.content;
    });

    const mergedTyping = computed(() => {
      if (typeof props.typing === "function")
        return props.typing(props.content as never, props.info);
      return props.typing;
    });

    const usingInnerAnimation = computed(() => {
      return (
        Boolean(mergedTyping.value) && typeof memoedContent.value === "string"
      );
    });

    watch(
      () =>
        [
          memoedContent.value,
          usingInnerAnimation.value,
          props.streaming,
        ] as const,
      () => {
        if (usingInnerAnimation.value) return;
        if (props.streaming) return;
        if (typeof memoedContent.value === "string")
          props.onTypingComplete?.(memoedContent.value);
      },
      { immediate: true },
    );

    const footerPlacement = computed(() => {
      if (props.footerPlacement) return props.footerPlacement;
      return props.placement === "start" ? "outer-start" : "outer-end";
    });

    const isEditing = computed(() => {
      return typeof props.editable === "boolean"
        ? props.editable
        : props.editable?.editing;
    });

    const isFooterInner = computed(() =>
      footerPlacement.value.includes("inner"),
    );

    const getSlotClassName = (slot: SemanticType) => {
      return [
        `${props.prefixCls}-${slot}`,
        contextConfig.value.classes?.[slot],
        props.classes?.[slot],
      ];
    };

    const getSlotStyle = (slot: SemanticType) => {
      return {
        ...contextConfig.value.styles?.[slot],
        ...props.styles?.[slot],
      };
    };

    const renderSlotNode = (
      name: "avatar" | "header" | "footer" | "extra",
      propSlot: BubbleSlot<any> | undefined,
    ) => {
      const slot = slots[name];
      if (slot) return slot({ content: props.content, info: props.info });
      return renderBubbleSlot(propSlot, props.content, props.info);
    };

    const renderHeader = () => {
      const node = renderSlotNode("header", props.header);
      if (!node) return null;
      return (
        <div class={getSlotClassName("header")} style={getSlotStyle("header")}>
          {node}
        </div>
      );
    };

    const renderFooter = () => {
      const node = renderSlotNode("footer", props.footer);
      if (!node) return null;
      return (
        <div
          class={[
            getSlotClassName("footer"),
            {
              [`${props.prefixCls}-footer-start`]:
                footerPlacement.value.includes("start"),
              [`${props.prefixCls}-footer-end`]:
                footerPlacement.value.includes("end"),
            },
          ]}
          style={getSlotStyle("footer")}
        >
          {node}
        </div>
      );
    };

    const renderMainContent = () => {
      if (isEditing.value) {
        if (typeof props.content !== "string")
          throw new Error(
            "[Bubble] Editable mode only supports string content.",
          );

        return (
          <EditableContent
            prefixCls={props.prefixCls}
            content={props.content}
            okText={
              (props.editable as EditableBubbleOption | undefined)?.okText
            }
            cancelText={
              (props.editable as EditableBubbleOption | undefined)?.cancelText
            }
            onEditConfirm={props.onEditConfirm}
            onEditCancel={props.onEditCancel}
          />
        );
      }

      const defaultMainContent =
        usingInnerAnimation.value && typeof memoedContent.value === "string" ? (
          <TypingContent
            prefixCls={props.prefixCls}
            streaming={props.streaming}
            typing={mergedTyping.value as true | BubbleAnimationOption}
            content={memoedContent.value}
            onTyping={props.onTyping}
            onTypingComplete={props.onTypingComplete}
          />
        ) : (
          memoedContent.value
        );

      return defaultMainContent;
    };

    const renderContent = () => {
      if (props.loading) {
        if (slots.loadingRender) {
          const slotNode = slots.loadingRender({
            content: props.content,
            info: props.info,
          });
          if (hasRenderableNode(slotNode)) return slotNode;
        }

        if (props.loadingRender)
          return props.loadingRender(props.content as never, props.info);

        return <Loading prefixCls={props.prefixCls} />;
      }

      return (
        <div class={getSlotClassName("body")} style={getSlotStyle("body")}>
          {renderHeader()}
          <div
            class={[
              `${prefixCls.value}-content`,
              `${prefixCls.value}-content-${variant.value}`,
              `${prefixCls.value}-content-${shape.value}`,
              contextConfig.value.classes?.content,
              props.classes?.content,
              {
                [`${prefixCls.value}-content-string`]:
                  typeof memoedContent.value === "string",
                [`${prefixCls.value}-content-editing`]: isEditing.value,
                [`${prefixCls.value}-content-${props.info.status}`]:
                  props.info.status,
              },
            ]}
            style={{
              ...contextConfig.value.styles?.content,
              ...props.styles?.content,
            }}
          >
            {isFooterInner.value ? (
              <>
                <div class={`${prefixCls.value}-content-with-footer`}>
                  {renderMainContent()}
                </div>
                {!isEditing.value ? renderFooter() : null}
              </>
            ) : (
              renderMainContent()
            )}
          </div>
          {!isEditing.value && !isFooterInner.value ? renderFooter() : null}
        </div>
      );
    };

    const { prefixCls, placement, variant, shape } = toRefs(props);

    return () => {
      const avatarNode = renderSlotNode("avatar", props.avatar);
      const extraNode = renderSlotNode("extra", props.extra);

      return (
        <div
          ref={rootRef}
          {...domAttrs.value}
          class={[
            prefixCls.value,
            `${prefixCls.value}-${placement.value}`,
            contextConfig.value.classes?.root,
            props.rootClass,
            props.classes?.root,
            hashId.value,
            cssVarCls.value,
            attrs.class,
            props.class,
            {
              [`${prefixCls.value}-loading`]: props.loading,
              [`${prefixCls.value}-${props.info.status}`]: props.info.status,
            },
          ]}
          style={[
            contextConfig.value.style,
            contextConfig.value.styles?.root,
            props.styles?.root,
            attrs.style as StyleValue,
            props.style,
          ]}
        >
          {avatarNode ? (
            <div
              class={getSlotClassName("avatar")}
              style={getSlotStyle("avatar")}
            >
              {avatarNode}
            </div>
          ) : null}

          {renderContent()}

          {!isEditing.value && !props.loading && extraNode ? (
            <div
              class={getSlotClassName("extra")}
              style={getSlotStyle("extra")}
            >
              {extraNode}
            </div>
          ) : null}
        </div>
      );
    };
  },
});

export default XBubble;
