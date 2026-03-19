import type { PropType, StyleValue } from "vue";

import { RightOutlined } from "@antdv-next/icons";
import { Popover } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref, useAttrs } from "vue";

import type { SourcesItem, SourcesProps, SourcesRef } from "./interface";

import useXComponentConfig from "../x-provider/hooks/use-x-component-config";
import CarouselCard from "./components/CarouselCard";
import useSourcesStyle from "./style";

export const XSources = defineComponent({
  name: "XSources",
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
    rootClassName: {
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
    onExpand: {
      type: Function as PropType<SourcesProps["onExpand"]>,
      default: undefined,
    },
  },
  emits: ["expand"],
  setup(props, { slots, expose, emit }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("sources");

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
      props.onExpand?.(newExpand);
      emit("expand", newExpand);
    };

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const mergedCls = computed(() => [
      props.prefixCls,
      contextConfig.value.className,
      props.rootClassName,
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

    return () => {
      const ContentNode = props.items ? (
        <ul class={`${props.prefixCls}-list`}>
          {props.items.map((item, index) => (
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
                {item.icon && (
                  <span class={`${props.prefixCls}-link-icon`}>
                    {item.icon}
                  </span>
                )}
                <span class={`${props.prefixCls}-link-title`}>
                  {item.title}
                </span>
              </a>
            </li>
          ))}
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
                <span class={`${props.prefixCls}-title`}>{props.title}</span>
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
                <span class={`${props.prefixCls}-title`}>{props.title}</span>
              </div>
              <div
                class={[
                  `${props.prefixCls}-content`,
                  props.classes?.content,
                  { [`${props.prefixCls}-content-hidden`]: !isExpand.value },
                ]}
                style={props.styles?.content}
              >
                {ContentNode}
              </div>
            </>
          )}
        </div>
      );
    };
  },
});

export default XSources;
