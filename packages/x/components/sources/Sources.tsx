import type { PropType, StyleValue } from "vue";

import { RightOutlined } from "@antdv-next/icons";
import { Popover } from "antdv-next";
import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, Transition, useAttrs } from "vue";

import type {
  SourcesItem,
  SourcesItemSlotInfo,
  SourcesProps,
  SourcesRef,
  SourcesTitleSlotInfo,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import initCollapseTransition from "../_utils/transition";
import { hasRenderableNode } from "../_utils/vue";
import CarouselCard from "./components/CarouselCard";
import useSourcesStyle from "./style";

export const XSources = defineComponent({
  name: "AxSources",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antdx-sources",
    },
    style: {
      type: [String, Object, Array] as PropType<SourcesProps["style"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<SourcesProps["styles"]>,
      default: () => ({}),
    },
    class: {
      type: [String, Array, Object] as PropType<SourcesProps["class"]>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<SourcesProps["classes"]>,
      default: () => ({}),
    },
    rootClass: {
      type: String,
      default: "",
    },
    inline: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array as PropType<SourcesItem[]>,
      default: undefined,
    },
    title: {
      type: [String, Number, Object] as PropType<SourcesProps["title"]>,
      default: undefined,
    },
    expandIconPosition: {
      type: String as PropType<SourcesProps["expandIconPosition"]>,
      default: "start",
    },
    onClick: {
      type: Function as PropType<SourcesProps["onClick"]>,
      default: undefined,
    },
    popoverOverlayWidth: {
      type: [Number, String] as PropType<SourcesProps["popoverOverlayWidth"]>,
      default: 300,
    },
    activeKey: {
      type: [String, Number] as PropType<SourcesProps["activeKey"]>,
      default: undefined,
    },
    expanded: {
      type: Boolean,
      default: undefined,
    },
    defaultExpanded: {
      type: Boolean,
      default: undefined,
    },
  },
  emits: ["expand"],
  setup(props, { slots, expose, emit }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("sources");
    const rootPrefixCls = computed(() => configCtx.value.getPrefixCls());
    const collapseTransition = computed(() =>
      initCollapseTransition(rootPrefixCls.value),
    );

    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useSourcesStyle(
      computed(() => props.prefixCls),
    );

    expose<SourcesRef>({
      get nativeElement() {
        return rootRef.value as HTMLElement;
      },
    });

    const innerExpanded = ref(props.defaultExpanded ?? true);

    const isExpand = computed(() => {
      if (props.expanded !== undefined) return props.expanded;
      return innerExpanded.value;
    });

    const toggleExpand = () => {
      const newExpand = !isExpand.value;
      if (props.expanded === undefined) innerExpanded.value = newExpand;
      emit("expand", newExpand);
    };

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const mergedCls = computed(() => [
      props.prefixCls,
      props.rootClass,
      contextConfig.value.classes?.root,
      props.classes?.root,
      hashId.value,
      cssVarCls.value,
      attrs.class,
      props.class,
      {
        [`${props.prefixCls}-inline`]: props.inline,
        [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
      },
    ]);

    const renderTitle = () => {
      const originNode = props.title;
      if (slots.title) {
        return slots.title({
          originNode,
        } as SourcesTitleSlotInfo);
      }

      return originNode;
    };

    const renderItemNode = (
      slotName: "iconRender" | "titleRender" | "description",
      item: SourcesItem,
      index: number,
      originNode: any,
    ) => {
      const slot = slots[slotName];
      if (slot) {
        return slot({
          item,
          index,
          originNode,
        } as SourcesItemSlotInfo);
      }

      return originNode;
    };

    return () => {
      const ContentNode = props.items ? (
        <ul class={`${props.prefixCls}-list`}>
          {props.items.map((item, index) => {
            const iconNode = renderItemNode(
              "iconRender",
              item,
              index,
              item.icon,
            );
            const titleNode = renderItemNode(
              "titleRender",
              item,
              index,
              item.title,
            );
            const descriptionNode = renderItemNode(
              "description",
              item,
              index,
              item.description,
            );

            return (
              <li
                key={item.key ?? index}
                class={`${props.prefixCls}-list-item`}
                onClick={() => props.onClick?.(item)}
              >
                <a
                  class={`${props.prefixCls}-link`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {hasRenderableNode(iconNode) && (
                    <span class={`${props.prefixCls}-link-icon`}>
                      {iconNode}
                    </span>
                  )}
                  <span class={`${props.prefixCls}-link-title`}>
                    {titleNode}
                  </span>
                  {hasRenderableNode(descriptionNode) && (
                    <span class={`${props.prefixCls}-link-description`}>
                      {descriptionNode}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        slots.default?.()
      );

      return (
        <div
          ref={rootRef}
          {...domAttrs.value}
          class={mergedCls.value}
          style={[
            contextConfig.value.style,
            contextConfig.value.styles?.root,
            props.styles?.root,
            attrs.style as StyleValue,
            props.style,
          ]}
        >
          {props.inline ? (
            <Popover
              content={
                <CarouselCard
                  classes={[
                    props.prefixCls,
                    hashId.value,
                    cssVarCls.value,
                    props.classes?.content,
                  ]}
                  style={props.styles?.content}
                  activeKey={props.activeKey}
                  prefixCls={props.prefixCls}
                  items={props.items}
                  onClick={props.onClick}
                  iconRenderSlot={
                    slots.iconRender
                      ? info => slots.iconRender?.(info as SourcesItemSlotInfo)
                      : undefined
                  }
                  titleRenderSlot={
                    slots.titleRender
                      ? info => slots.titleRender?.(info as SourcesItemSlotInfo)
                      : undefined
                  }
                  descriptionSlot={
                    slots.description
                      ? info => slots.description?.(info as SourcesItemSlotInfo)
                      : undefined
                  }
                />
              }
              open={props.inline ? undefined : false}
              styles={{
                content: {
                  width:
                    typeof props.popoverOverlayWidth === "number"
                      ? `${props.popoverOverlayWidth}px`
                      : props.popoverOverlayWidth,
                },
              }}
              placement="top"
            >
              <div
                class={[
                  props.prefixCls,
                  `${props.prefixCls}-title-wrapper`,
                  props.classes?.title,
                ]}
                style={props.styles?.title}
              >
                <span class={`${props.prefixCls}-title`}>{renderTitle()}</span>
              </div>
            </Popover>
          ) : (
            <>
              <div
                class={[
                  `${props.prefixCls}-title-wrapper`,
                  `${props.prefixCls}-icon-position-${props.expandIconPosition}`,
                  props.classes?.title,
                ]}
                onClick={toggleExpand}
                style={props.styles?.title}
              >
                <RightOutlined
                  class={`${props.prefixCls}-title-down-icon`}
                  rotate={isExpand.value ? 90 : 0}
                />
                <span class={`${props.prefixCls}-title`}>{renderTitle()}</span>
              </div>
              <Transition {...collapseTransition.value}>
                {isExpand.value ? (
                  <div
                    class={[
                      `${props.prefixCls}-content`,
                      props.classes?.content,
                    ]}
                    style={props.styles?.content}
                  >
                    {ContentNode}
                  </div>
                ) : null}
              </Transition>
            </>
          )}
        </div>
      );
    };
  },
});

export default XSources;
