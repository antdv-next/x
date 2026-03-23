import type { CSSProperties, PropType } from "vue";

import { LeftOutlined, RightOutlined } from "@antdv-next/icons";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { Transition, computed, defineComponent } from "vue";

import type { SemanticType, ThoughtChainItemType } from "./interface";

import Status from "./Status";

export default defineComponent({
  name: "ThoughtChainNode",
  props: {
    item: {
      type: Object as PropType<ThoughtChainItemType>,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
    prefixCls: {
      type: String,
      required: true,
    },
    lineStyle: {
      type: [Boolean, String] as PropType<
        boolean | "solid" | "dashed" | "dotted"
      >,
      default: "solid",
    },
    expanded: {
      type: Boolean,
      default: true,
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
  emits: ["toggleExpand"],
  setup(props, { emit }) {
    const configCtx = useConfig();

    const isRtl = computed(() => configCtx.value.direction === "rtl");

    const nodePrefixCls = computed(() => `${props.prefixCls}-node`);

    // Resolve line border style
    const resolvedLineStyle = computed(() => {
      if (props.lineStyle === false || props.isLast) return "none";
      if (props.lineStyle === true) return "solid";
      return props.lineStyle;
    });

    // Render icon
    const renderIcon = () => {
      const { item, index } = props;

      if (item.icon === false) return null;

      const iconContent = item.icon ?? (
        <span class={`${nodePrefixCls.value}-index-icon`}>{index + 1}</span>
      );

      return (
        <div
          class={[
            `${nodePrefixCls.value}-icon`,
            props.classes?.itemIcon,
            {
              [`${nodePrefixCls.value}-icon-${resolvedLineStyle.value}`]:
                resolvedLineStyle.value !== "none",
            },
          ]}
          style={props.styles?.itemIcon}
        >
          {item.status ? (
            <Status status={item.status} prefixCls={props.prefixCls} />
          ) : (
            iconContent
          )}
        </div>
      );
    };

    // Render header
    const renderHeader = () => {
      const { item } = props;
      const cls = nodePrefixCls.value;
      const hasContent = item.content !== undefined;

      // Only show collapse icon when collapsible AND has content
      const collapseIcon =
        item.collapsible && hasContent ? (
          <span
            class={`${cls}-collapse-icon`}
            style={{
              transform: props.expanded
                ? "rotate(90deg)"
                : isRtl.value
                  ? "rotate(-90deg)"
                  : "rotate(0deg)",
            }}
          >
            {isRtl.value ? <LeftOutlined /> : <RightOutlined />}
          </span>
        ) : null;

      return (
        <div
          class={[`${cls}-header`, props.classes?.itemHeader]}
          style={props.styles?.itemHeader}
        >
          <div
            class={[
              `${cls}-title`,
              {
                [`${cls}-collapsible`]: item.collapsible && hasContent,
                [`${props.prefixCls}-motion-blink`]: item.blink,
              },
            ]}
            onClick={
              item.collapsible && hasContent
                ? () => emit("toggleExpand")
                : undefined
            }
          >
            {item.title}
            {collapseIcon}
          </div>
          {item.description && (
            <div class={`${cls}-description`}>{item.description}</div>
          )}
        </div>
      );
    };

    // Collapse transition helpers
    function onBeforeEnter(el: Element) {
      (el as HTMLElement).style.height = "0";
      (el as HTMLElement).style.opacity = "0";
    }

    function onEnter(el: Element) {
      const htmlEl = el as HTMLElement;
      htmlEl.style.height = `${htmlEl.scrollHeight}px`;
      htmlEl.style.opacity = "1";
    }

    function onAfterEnter(el: Element) {
      (el as HTMLElement).style.height = "";
      (el as HTMLElement).style.opacity = "";
    }

    function onBeforeLeave(el: Element) {
      (el as HTMLElement).style.height =
        `${(el as HTMLElement).scrollHeight}px`;
      (el as HTMLElement).style.opacity = "1";
    }

    function onLeave(el: Element) {
      void (el as HTMLElement).offsetHeight;
      (el as HTMLElement).style.height = "0";
      (el as HTMLElement).style.opacity = "0";
    }

    function onAfterLeave(el: Element) {
      (el as HTMLElement).style.height = "";
      (el as HTMLElement).style.opacity = "";
    }

    return () => {
      const { item } = props;
      const cls = nodePrefixCls.value;

      const showContent =
        item.content !== undefined && (!item.collapsible || props.expanded);

      return (
        <div class={[`${cls}`, props.classes?.item]} style={props.styles?.item}>
          {renderIcon()}
          <div class={`${cls}-box`}>
            {renderHeader()}

            {item.content !== undefined && (
              <Transition
                name={`${props.prefixCls}-collapse`}
                onBeforeEnter={onBeforeEnter}
                onEnter={onEnter}
                onAfterEnter={onAfterEnter}
                onBeforeLeave={onBeforeLeave}
                onLeave={onLeave}
                onAfterLeave={onAfterLeave}
              >
                {showContent ? (
                  <div>
                    <div
                      class={[`${cls}-content`, props.classes?.itemContent]}
                      style={props.styles?.itemContent}
                    >
                      <div class={`${cls}-content-box`}>{item.content}</div>
                    </div>
                  </div>
                ) : null}
              </Transition>
            )}

            {item.footer && (
              <div
                class={[`${cls}-footer`, props.classes?.itemFooter]}
                style={props.styles?.itemFooter}
              >
                {item.footer}
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
