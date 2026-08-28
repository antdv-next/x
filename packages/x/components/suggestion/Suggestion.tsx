import type { PropType, StyleValue } from "vue";

import { Cascader, Flex } from "antdv-next";
import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import type {
  RenderChildrenProps,
  SuggestionItem,
  SuggestionItemRenderInfo,
  SuggestionProps,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { hasRenderableNode } from "../_utils/vue";
import useStyle from "./style";
import useActive from "./useActive";

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
    items: {
      type: [Array, Function] as PropType<SuggestionProps["items"]>,
      default: () => [],
    },
    block: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:open", "openChange", "select"],
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
    /**
     * What the last `onTrigger` asked for. A function `items` is usually an inline arrow,
     * so it gets a new identity on every parent render — without this the watcher below
     * would re-evaluate it with no info and drop the triggered list.
     */
    const triggerInfo = ref<any>();

    const resolveItems = (source: SuggestionProps["items"], info?: any) => {
      if (typeof source === "function") return source(info);
      return Array.isArray(source) ? source : [];
    };

    watch(
      () => props.items,
      nextItems => {
        itemList.value = resolveItems(nextItems, triggerInfo.value);
      },
      { immediate: true },
    );

    const triggerOpen = (nextOpen: boolean) => {
      if (props.open === undefined) {
        innerOpen.value = nextOpen;
      }

      emit("update:open", nextOpen);
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

      triggerInfo.value = nextInfo;

      if (typeof props.items === "function") {
        itemList.value = resolveItems(props.items, nextInfo);
      }

      triggerOpen(true);
    };

    const onInternalChange = (valuePath: unknown, selectedOptions: unknown) => {
      const path = Array.isArray(valuePath) ? valuePath : [];
      const lastValue = path[path.length - 1];
      const selected = (selectedOptions ?? []) as SuggestionItem[];

      if (lastValue !== undefined) {
        const selectedValue = String(lastValue);
        emit("select", selectedValue, selected);
      }

      triggerOpen(false);
    };

    const [activePath, onKeyDown, shouldSelectOnEnter] = useActive(
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

    /**
     * Cascader renders our children as its raw input element, so every keydown from the
     * children bubbles into BaseSelect's keyboard model. That model is built for a
     * non-editable trigger and breaks typing inside an editable one such as Sender:
     *
     * - Space is always `preventDefault()`ed, so no space can be typed;
     * - Enter is always `preventDefault()`ed, even when there is nothing to select;
     * - Backspace makes the option list step back a level or close the popup.
     *
     * Keep exactly those inside the content wrapper. Every other key — Escape, arrows,
     * application shortcuts — must keep bubbling, otherwise the app around us stops
     * receiving keyboard events while the trigger has focus.
     */
    const onContentKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (key === "Enter") {
        // Forward it only when the popup owns this Enter, so the option list can select.
        if (!shouldSelectOnEnter(event)) {
          event.stopPropagation();
        }
        return;
      }

      if (key === " " || (key === "Backspace" && mergedOpen.value)) {
        event.stopPropagation();
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
              onKeydown={onContentKeyDown}
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
