import type { CSSProperties, PropType, VNodeChild } from "vue";

import { LeftOutlined, RightOutlined } from "@antdv-next/icons";
import { useConfig } from "antdv-next/config-provider/context";
import { Transition, computed, defineComponent } from "vue";

import type {
  SemanticType,
  ThoughtChainContentSlotInfo,
  ThoughtChainDescriptionSlotInfo,
  ThoughtChainFooterSlotInfo,
  ThoughtChainIconSlotInfo,
  ThoughtChainItemType,
  ThoughtChainTitleSlotInfo,
} from "./interface";

import { hasRenderableNode } from "../_utils/vue";
import { STATUS_ICON_MAP } from "./Status";

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
    iconRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainIconSlotInfo) => VNodeChild) | undefined
      >,
      default: undefined,
    },
    titleRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainTitleSlotInfo) => VNodeChild) | undefined
      >,
      default: undefined,
    },
    descriptionRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainDescriptionSlotInfo) => VNodeChild) | undefined
      >,
      default: undefined,
    },
    contentRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainContentSlotInfo) => VNodeChild) | undefined
      >,
      default: undefined,
    },
    footerRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainFooterSlotInfo) => VNodeChild) | undefined
      >,
      default: undefined,
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

    const statusCls = computed(() => `${props.prefixCls}-status`);

    const createSharedSlotInfo = (collapsible: boolean) => ({
      item: props.item,
      index: props.index,
      expanded: props.expanded,
      collapsible,
      toggleExpand: () => emit("toggleExpand"),
    });

    // Render icon
    const renderIcon = (collapsible: boolean) => {
      const { item, index } = props;

      const defaultIcon = (
        <span class={`${nodePrefixCls.value}-index-icon`}>{index + 1}</span>
      );
      const originNode =
        item.icon === false
          ? null
          : item.status
            ? STATUS_ICON_MAP[item.status]
            : (item.icon ?? defaultIcon);
      const iconNode = props.iconRenderSlot
        ? props.iconRenderSlot({
            ...createSharedSlotInfo(collapsible),
            originNode,
            status: item.status,
          } as ThoughtChainIconSlotInfo)
        : originNode;

      if (!hasRenderableNode(iconNode)) return null;

      return (
        <div
          class={[
            statusCls.value,
            `${nodePrefixCls.value}-icon`,
            props.classes?.itemIcon,
            {
              [`${statusCls.value}-${item.status}`]: item.status,
              [`${nodePrefixCls.value}-icon-${resolvedLineStyle.value}`]:
                typeof props.lineStyle !== "boolean" &&
                resolvedLineStyle.value !== "none",
            },
          ]}
          style={props.styles?.itemIcon}
        >
          {iconNode}
        </div>
      );
    };

    // Render header
    const renderHeader = (contentNode: VNodeChild | null | undefined) => {
      const { item } = props;
      const cls = nodePrefixCls.value;
      const hasContent = hasRenderableNode(contentNode);
      const collapsible = !!item.collapsible && hasContent;

      // Only show collapse icon when collapsible AND has content
      const collapseIcon = collapsible ? (
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
      const titleNode = props.titleRenderSlot
        ? props.titleRenderSlot({
            ...createSharedSlotInfo(collapsible),
            originNode: item.title,
          } as ThoughtChainTitleSlotInfo)
        : item.title;
      const descriptionNode = props.descriptionRenderSlot
        ? props.descriptionRenderSlot({
            ...createSharedSlotInfo(collapsible),
            originNode: item.description,
          } as ThoughtChainDescriptionSlotInfo)
        : item.description;
      const hasTitle = hasRenderableNode(titleNode);
      const hasDescription = hasRenderableNode(descriptionNode);

      return (
        <div
          class={[`${cls}-header`, props.classes?.itemHeader]}
          style={props.styles?.itemHeader}
        >
          {hasTitle && (
            <div
              class={[
                `${cls}-title`,
                {
                  [`${cls}-collapsible`]: collapsible,
                  [`${props.prefixCls}-motion-blink`]: item.blink,
                },
              ]}
              onClick={collapsible ? () => emit("toggleExpand") : undefined}
            >
              {titleNode}
              {collapseIcon}
            </div>
          )}
          {hasDescription && (
            <div class={`${cls}-description`}>{descriptionNode}</div>
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
      const slotInfoCollapsible =
        !!item.collapsible &&
        (hasRenderableNode(item.content) || !!props.contentRenderSlot);
      const contentNode = props.contentRenderSlot
        ? props.contentRenderSlot({
            ...createSharedSlotInfo(slotInfoCollapsible),
            originNode: item.content,
          } as ThoughtChainContentSlotInfo)
        : item.content;
      const hasContent = hasRenderableNode(contentNode);
      const collapsible = !!item.collapsible && hasContent;
      const footerNode = props.footerRenderSlot
        ? props.footerRenderSlot({
            ...createSharedSlotInfo(collapsible),
            originNode: item.footer,
          } as ThoughtChainFooterSlotInfo)
        : item.footer;
      const showContent = hasContent && (!collapsible || props.expanded);

      return (
        <div class={[`${cls}`, props.classes?.item]} style={props.styles?.item}>
          {renderIcon(collapsible)}
          <div class={`${cls}-box`}>
            {renderHeader(contentNode)}

            {hasContent && (
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
                      <div class={`${cls}-content-box`}>{contentNode}</div>
                    </div>
                  </div>
                ) : null}
              </Transition>
            )}

            {hasRenderableNode(footerNode) && (
              <div
                class={[`${cls}-footer`, props.classes?.itemFooter]}
                style={props.styles?.itemFooter}
              >
                {footerNode}
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
