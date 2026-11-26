import type { CSSProperties, PropType, VNodeChild } from "vue";

import { LeftOutlined, RightOutlined } from "@antdv-next/icons";
import { useConfig } from "antdv-next/config-provider/context";
import {
  Fragment,
  Text,
  Transition,
  computed,
  defineComponent,
  isVNode,
  vShow,
  withDirectives,
} from "vue";

import type {
  SemanticType,
  ThoughtChainCollapseIconSlotInfo,
  ThoughtChainContentSlotInfo,
  ThoughtChainDescriptionSlotInfo,
  ThoughtChainFooterSlotInfo,
  ThoughtChainIconSlotInfo,
  ThoughtChainItemType,
  ThoughtChainTitleSlotInfo,
} from "./interface";

import { hasRenderableNode } from "../_utils/vue";
import { STATUS_ICON_MAP } from "./Status";

function hasRenderableCollapseIcon(node: unknown): boolean {
  if (!hasRenderableNode(node)) return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (Array.isArray(node)) return node.some(hasRenderableCollapseIcon);
  if (isVNode(node)) {
    if (node.type === Text) {
      return typeof node.children === "string"
        ? node.children.trim().length > 0
        : hasRenderableNode(node.children);
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      return node.children.some(hasRenderableCollapseIcon);
    }
  }
  return true;
}

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
    prefixCls: {
      type: String,
      required: true,
    },
    lineStyle: {
      type: [Boolean, String] as PropType<
        boolean | "solid" | "dashed" | "dotted"
      >,
      default: true,
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
    collapseIconRenderSlot: {
      type: Function as PropType<
        ((info: ThoughtChainCollapseIconSlotInfo) => VNodeChild) | undefined
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

    const statusCls = computed(() => `${props.prefixCls}-status`);

    let toggledBySlot = false;

    const createSharedSlotInfo = (collapsible: boolean) => ({
      item: props.item,
      index: props.index,
      expanded: props.expanded,
      collapsible,
      toggleExpand: () => {
        toggledBySlot = true;
        // 复位必须在宏任务里：真实浏览器在每个监听器返回后就会跑 microtask
        // checkpoint，microtask 会在冒泡到标题容器之前执行；同一事件派发内的
        // 容器 onClick 会消费该标记，下一次点击不受影响。
        setTimeout(() => {
          toggledBySlot = false;
        });
        emit("toggleExpand");
      },
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
              [`${nodePrefixCls.value}-icon-${props.lineStyle}`]:
                typeof props.lineStyle === "string",
              [`${nodePrefixCls.value}-icon-none`]: props.lineStyle === false,
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

      const collapseRotation = props.expanded ? (isRtl.value ? -90 : 90) : 0;
      const defaultCollapseIcon = isRtl.value ? (
        <LeftOutlined rotate={collapseRotation} />
      ) : (
        <RightOutlined rotate={collapseRotation} />
      );
      // `false` hides the indicator; a custom node replaces the default arrow.
      const originCollapseIcon =
        item.collapseIcon === false
          ? null
          : (item.collapseIcon ?? defaultCollapseIcon);
      const collapseIconNode = collapsible
        ? props.collapseIconRenderSlot
          ? props.collapseIconRenderSlot({
              ...createSharedSlotInfo(collapsible),
              originNode: originCollapseIcon,
            } as ThoughtChainCollapseIconSlotInfo)
          : originCollapseIcon
        : null;
      // Only show collapse icon when collapsible AND has content
      const collapseIcon =
        collapsible && hasRenderableCollapseIcon(collapseIconNode) ? (
          <span
            class={[`${cls}-collapse-icon`, props.classes?.itemCollapseIcon]}
            style={props.styles?.itemCollapseIcon}
          >
            {collapseIconNode}
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
              onClick={
                collapsible
                  ? () => {
                      if (toggledBySlot) {
                        toggledBySlot = false;
                        return;
                      }
                      emit("toggleExpand");
                    }
                  : undefined
              }
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
      const destroyOnHidden = item.destroyOnHidden ?? true;

      // Keep the content mounted and only toggle it with `v-show` when
      // `destroyOnHidden` is false, so streaming output and inner component
      // state survive a collapse. Keep `vShow` attached in both modes so
      // changing `destroyOnHidden` at runtime does not reset its lifecycle.
      const renderContent = () => {
        const node = (
          <div>
            <div
              class={[`${cls}-content`, props.classes?.itemContent]}
              style={props.styles?.itemContent}
            >
              <div class={`${cls}-content-box`}>{contentNode}</div>
            </div>
          </div>
        );

        return withDirectives(node, [[vShow, showContent]]);
      };

      return (
        <div class={[`${cls}`, props.classes?.item]} style={props.styles?.item}>
          {renderIcon(collapsible)}
          <div class={`${cls}-box`}>
            {renderHeader(contentNode)}

            {hasContent && (
              <Transition
                name={`${props.prefixCls}-collapse`}
                persisted={!destroyOnHidden}
                onBeforeEnter={onBeforeEnter}
                onEnter={onEnter}
                onAfterEnter={onAfterEnter}
                onBeforeLeave={onBeforeLeave}
                onLeave={onLeave}
                onAfterLeave={onAfterLeave}
              >
                {destroyOnHidden && !showContent ? null : renderContent()}
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
