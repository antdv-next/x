import type { CSSProperties, PropType, StyleValue } from "vue";

import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import type {
  SemanticType,
  ThoughtChainContentSlotInfo,
  ThoughtChainDescriptionSlotInfo,
  ThoughtChainFooterSlotInfo,
  ThoughtChainIconSlotInfo,
  ThoughtChainItemType,
  ThoughtChainProps,
  ThoughtChainRef,
  ThoughtChainTitleSlotInfo,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import Node from "./Node";
import useThoughtChainStyle from "./style";

export const XThoughtChain = defineComponent({
  name: "AxThoughtChain",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-thought-chain",
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
      type: [String, Array, Object] as PropType<ThoughtChainProps["class"]>,
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
    items: {
      type: Array as PropType<ThoughtChainItemType[]>,
      default: () => [],
    },
    defaultExpandedKeys: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    expandedKeys: {
      type: Array as PropType<string[]>,
      default: undefined,
    },
    line: {
      type: [Boolean, String] as PropType<
        boolean | "solid" | "dashed" | "dotted"
      >,
      default: "solid",
    },
  },
  emits: ["update:expandedKeys", "expand"],
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("thoughtChain");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useThoughtChainStyle(
      computed(() => props.prefixCls),
    );

    // Expand state
    const internalExpandedKeys = ref<string[]>(props.defaultExpandedKeys ?? []);

    const mergedExpandedKeys = computed(() =>
      props.expandedKeys !== undefined
        ? props.expandedKeys
        : internalExpandedKeys.value,
    );

    watch(
      () => props.expandedKeys,
      val => {
        if (val !== undefined) {
          internalExpandedKeys.value = [...val];
        }
      },
    );

    function toggleExpand(key: string) {
      const keys = [...mergedExpandedKeys.value];
      const idx = keys.indexOf(key);
      if (idx >= 0) {
        keys.splice(idx, 1);
      } else {
        keys.push(key);
      }
      internalExpandedKeys.value = keys;
      emit("update:expandedKeys", keys);
      emit("expand", keys);
    }

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const prefixCls = computed(() => props.prefixCls);

    // Merge context + props classes/styles for passing to Node
    const mergedClasses = computed(() => {
      const ctx = contextConfig.value.classes ?? {};
      const prop = props.classes ?? {};
      const result: Partial<Record<SemanticType, string>> = {};
      const keys = new Set([
        ...Object.keys(ctx),
        ...Object.keys(prop),
      ]) as Set<SemanticType>;
      for (const k of keys) {
        const vals = [ctx[k], prop[k]].filter(Boolean).join(" ");
        if (vals) result[k] = vals;
      }
      return result;
    });

    const mergedStyles = computed(() => {
      const ctx = contextConfig.value.styles ?? {};
      const prop = props.styles ?? {};
      const result: Partial<Record<SemanticType, CSSProperties>> = {};
      const keys = new Set([
        ...Object.keys(ctx),
        ...Object.keys(prop),
      ]) as Set<SemanticType>;
      for (const k of keys) {
        result[k] = { ...ctx[k], ...prop[k] };
      }
      return result;
    });

    expose<ThoughtChainRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    return () => {
      const items = props.items;

      return (
        <div
          ref={rootRef}
          {...domAttrs.value}
          class={[
            prefixCls.value,
            `${prefixCls.value}-box`,
            contextConfig.value.classes?.root,
            props.rootClass,
            props.classes?.root,
            hashId.value,
            cssVarCls.value,
            attrs.class,
            props.class,
            {
              [`${prefixCls.value}-rtl`]: configCtx.value.direction === "rtl",
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
          {items.map((item, index) => {
            const key = item.key ?? String(index);
            return (
              <Node
                key={key}
                item={item}
                index={index}
                isLast={index === items.length - 1}
                prefixCls={prefixCls.value}
                lineStyle={props.line}
                expanded={mergedExpandedKeys.value.includes(key)}
                classes={mergedClasses.value}
                styles={mergedStyles.value}
                iconRenderSlot={
                  (slots.iconRender ?? slots["icon-render"])
                    ? info =>
                        (slots.iconRender ?? slots["icon-render"])?.(
                          info as ThoughtChainIconSlotInfo,
                        )
                    : undefined
                }
                titleRenderSlot={
                  slots.title
                    ? info => slots.title?.(info as ThoughtChainTitleSlotInfo)
                    : undefined
                }
                descriptionRenderSlot={
                  slots.description
                    ? info =>
                        slots.description?.(
                          info as ThoughtChainDescriptionSlotInfo,
                        )
                    : undefined
                }
                contentRenderSlot={
                  slots.content
                    ? info =>
                        slots.content?.(info as ThoughtChainContentSlotInfo)
                    : undefined
                }
                footerRenderSlot={
                  slots.footer
                    ? info => slots.footer?.(info as ThoughtChainFooterSlotInfo)
                    : undefined
                }
                onToggleExpand={() => toggleExpand(key)}
              />
            );
          })}
        </div>
      );
    };
  },
});

export default XThoughtChain;
