import type { PropType, StyleValue } from "vue";

import { Cascader, Flex } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import type {
  RenderChildrenProps,
  SuggestionItem,
  SuggestionItemRenderInfo,
  SuggestionProps,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import useStyle from "./style";
import useActive from "./useActive";

const hasRenderableNode = (node: unknown): boolean => {
  if (Array.isArray(node))
    return node.some(
      item => item !== null && item !== undefined && item !== false,
    );

  return node !== null && node !== undefined && node !== false;
};

const XSuggestion = defineComponent({
  name: "AxSuggestion",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-suggestion",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<SuggestionProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<SuggestionProps["classes"]>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<SuggestionProps["styles"]>,
      default: () => ({}),
    },
    open: {
      type: Boolean,
      default: undefined,
    },
    onOpenChange: {
      type: Function as PropType<SuggestionProps["onOpenChange"]>,
      default: undefined,
    },
    onSelect: {
      type: Function as PropType<SuggestionProps["onSelect"]>,
      default: undefined,
    },
    items: {
      type: [Array, Function] as PropType<SuggestionProps["items"]>,
      default: () => [],
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["openChange", "select"],
  setup(props, { slots, emit }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("suggestion");

    const prefixCls = computed(
      () =>
        configCtx.value.getPrefixCls?.("suggestion", props.prefixCls) ??
        props.prefixCls,
    );

    const isRtl = computed(() => configCtx.value.direction === "rtl");

    const [hashId, cssVarCls] = useStyle(prefixCls);

    const mergedClasses = computed(() => ({
      ...contextConfig.value.classes,
      ...props.classes,
    }));

    const mergedStyles = computed(() => ({
      ...contextConfig.value.styles,
      ...props.styles,
    }));

    const popupRootClass = computed(() => {
      return [
        mergedClasses.value.popup,
        prefixCls.value,
        props.block ? `${prefixCls.value}-block` : "",
      ]
        .filter(Boolean)
        .join(" ");
    });

    const innerOpen = ref(false);
    const mergedOpen = computed(() => props.open ?? innerOpen.value);
    const itemList = ref<SuggestionItem[]>([]);

    watch(
      () => props.items,
      nextItems => {
        if (Array.isArray(nextItems)) {
          itemList.value = nextItems;
        } else if (typeof nextItems === "function") {
          itemList.value = nextItems();
        } else {
          itemList.value = [];
        }
      },
      { immediate: true },
    );

    const triggerOpen = (nextOpen: boolean) => {
      if (props.open === undefined) {
        innerOpen.value = nextOpen;
      }

      props.onOpenChange?.(nextOpen);
      emit("openChange", nextOpen);
    };

    const onClose = () => {
      triggerOpen(false);
    };

    const onTrigger: RenderChildrenProps["onTrigger"] = nextInfo => {
      if (nextInfo === false) {
        triggerOpen(false);
        return;
      }

      if (typeof props.items === "function") {
        itemList.value = props.items(nextInfo);
      }

      triggerOpen(true);
    };

    const onInternalChange = (valuePath: unknown, selectedOptions: unknown) => {
      const path = Array.isArray(valuePath) ? valuePath : [];
      const lastValue = path[path.length - 1];
      const selected = (selectedOptions ?? []) as SuggestionItem[];

      if (lastValue !== undefined) {
        const selectedValue = String(lastValue);
        props.onSelect?.(selectedValue, selected);
        emit("select", selectedValue, selected);
      }

      triggerOpen(false);
    };

    const [activePath, onKeyDown] = useActive(
      itemList as any,
      mergedOpen as any,
      isRtl as any,
      onClose,
    );

    const onInternalOpenChange = (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    };

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const renderItemNode = (
      slotName: "labelRender" | "iconRender" | "extraRender",
      info: SuggestionItemRenderInfo,
    ) => {
      const slot = slots[slotName];
      if (slot) return slot(info);

      return info.originNode;
    };

    return () => {
      const childNode = slots.default?.({
        onTrigger,
        onKeyDown,
        open: mergedOpen.value,
      });

      return (
        <Cascader
          {...domAttrs.value}
          options={itemList.value}
          open={mergedOpen.value}
          value={activePath.value}
          multiple={false}
          placement={isRtl.value ? "topRight" : "topLeft"}
          optionRender={option => {
            const item = option as SuggestionItem;
            const labelNode = renderItemNode("labelRender", {
              item,
              originNode: item.label,
            });
            const iconNode = renderItemNode("iconRender", {
              item,
              originNode: item.icon,
            });
            const extraNode = renderItemNode("extraRender", {
              item,
              originNode: item.extra,
            });

            return (
              <Flex class={`${prefixCls.value}-item`}>
                {hasRenderableNode(iconNode) && (
                  <div class={`${prefixCls.value}-item-icon`}>{iconNode}</div>
                )}
                {labelNode}
                {hasRenderableNode(extraNode) && (
                  <div class={`${prefixCls.value}-item-extra`}>{extraNode}</div>
                )}
              </Flex>
            );
          }}
          classes={{
            popup: {
              root: popupRootClass.value,
            },
          }}
          styles={{
            popup: {
              root: mergedStyles.value.popup,
            },
          }}
          style={[
            contextConfig.value.style,
            mergedStyles.value.root,
            props.style,
          ]}
          onOpenChange={onInternalOpenChange}
          onChange={onInternalChange as any}
          popupMatchSelectWidth={props.block}
        >
          <div
            class={[
              prefixCls.value,
              props.rootClass,
              props.class,
              contextConfig.value.classes?.root,
              mergedClasses.value.root,
              hashId.value,
              cssVarCls.value,
              {
                [`${prefixCls.value}-block`]: props.block,
              },
            ]}
            style={[
              contextConfig.value.style,
              mergedStyles.value.root,
              props.style,
            ]}
          >
            <div
              class={[
                `${prefixCls.value}-content`,
                contextConfig.value.classes?.content,
                mergedClasses.value.content,
              ]}
              style={[
                contextConfig.value.styles?.content,
                mergedStyles.value.content,
              ]}
            >
              {childNode}
            </div>
          </div>
        </Cascader>
      );
    };
  },
});

export default XSuggestion;
