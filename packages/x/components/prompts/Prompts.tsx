import type { CSSProperties, PropType, StyleValue } from "vue";

import { useConfig } from "antdv-next/dist/config-provider/context";
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  ref,
  useAttrs,
} from "vue";

import type {
  PromptDataItem,
  PromptsClickInfo,
  PromptsItemType,
  PromptsProps,
  PromptsRef,
  PromptsItemSlotInfo,
  PromptsTitleSlotInfo,
  SemanticType,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import usePromptsStyle from "./style";

function hasChildren(item: PromptDataItem): item is PromptsItemType {
  const children = (item as PromptsItemType).children;
  return Array.isArray(children) && children.length > 0;
}

function getItemDomAttrs(item: PromptDataItem) {
  const domAttrs = { ...item } as Record<string, unknown>;

  delete domAttrs.key;
  delete domAttrs.icon;
  delete domAttrs.label;
  delete domAttrs.description;
  delete domAttrs.disabled;
  delete domAttrs.class;
  delete domAttrs.style;
  delete domAttrs.children;

  return domAttrs;
}

function hasRenderableNode(node: unknown): boolean {
  if (Array.isArray(node))
    return node.some(
      item => item !== null && item !== undefined && item !== false,
    );

  return node !== null && node !== undefined && node !== false;
}

export const XPrompts = defineComponent({
  name: "XPrompts",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<PromptsItemType[]>,
      default: undefined,
    },
    title: {
      type: [String, Number, Object, Array] as PropType<PromptsProps["title"]>,
      default: undefined,
    },
    onItemClick: {
      type: Function as PropType<PromptsProps["onItemClick"]>,
      default: undefined,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    styles: {
      type: Object as PropType<PromptsProps["styles"]>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<PromptsProps["classes"]>,
      default: () => ({}),
    },
    prefixCls: {
      type: String,
      default: "antd-prompts",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<PromptsProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<PromptsProps["style"]>,
      default: undefined,
    },
    fadeIn: {
      type: Boolean,
      default: false,
    },
    fadeInLeft: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["itemClick"],
  setup(props, { expose, emit, slots }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("prompts");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = usePromptsStyle(
      computed(() => props.prefixCls),
    );
    const rootPrefixCls = computed(() => configCtx.value.getPrefixCls());
    const motionName = computed(() => {
      if (!props.fadeIn && !props.fadeInLeft) return "";
      return `${rootPrefixCls.value}-x-fade${props.fadeInLeft ? "-left" : ""}`;
    });

    // 仿照 React CSSMotion：mount 时把 appear class 直接加在根节点上，
    // 然后下一帧切换到 appear-active，transitionend 后清除。
    const motionClass = ref<string>("");

    onMounted(() => {
      if (!motionName.value) return;
      const mn = motionName.value;
      // 第一帧：加 prepare class（触发初始状态）
      motionClass.value = `${mn} ${mn}-enter ${mn}-appear ${mn}-appear-prepare ${mn}-enter-prepare`;
      void nextTick(() => {
        // 强制 reflow，让浏览器识别初始状态
        rootRef.value?.getBoundingClientRect();
        // 第二帧：切换到 active class（触发过渡动画）
        motionClass.value = `${mn} ${mn}-enter ${mn}-appear ${mn}-appear-active ${mn}-enter-active`;
        const el = rootRef.value;
        if (!el) return;
        const onEnd = () => {
          motionClass.value = "";
          el.removeEventListener("transitionend", onEnd);
          el.removeEventListener("animationend", onEnd);
        };
        el.addEventListener("transitionend", onEnd);
        el.addEventListener("animationend", onEnd);
      });
    });

    expose<PromptsRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const mergedClasses = computed(() => {
      return {
        ...contextConfig.value.classes,
        ...props.classes,
      } as Partial<Record<SemanticType, string>>;
    });

    const mergedStyles = computed(() => {
      return {
        ...contextConfig.value.styles,
        ...props.styles,
      } as Partial<Record<SemanticType, CSSProperties>>;
    });

    const triggerItemClick = (item: PromptDataItem, nested: boolean) => {
      if (item.disabled || (!nested && hasChildren(item))) return;

      const info: PromptsClickInfo = { data: item };
      props.onItemClick?.(info);
      emit("itemClick", info);
    };

    const renderTitle = () => {
      if (slots.title) {
        return slots.title({
          originNode: props.title,
        } as PromptsTitleSlotInfo);
      }

      return props.title;
    };

    const renderItemNode = (
      slotName: "labelRender" | "description" | "iconRender",
      item: PromptDataItem,
      index: number,
      nested: boolean,
      originNode: PromptsItemSlotInfo["originNode"],
    ) => {
      const slot = slots[slotName];
      if (slot) {
        return slot({
          item,
          originNode,
          index,
          nested,
        } as PromptsItemSlotInfo);
      }

      return originNode;
    };

    const renderItems = (items?: PromptDataItem[], nested = false) => {
      if (!items?.length) return null;

      return (
        <div
          class={[
            `${props.prefixCls}-list`,
            nested ? mergedClasses.value.subList : mergedClasses.value.list,
            {
              [`${props.prefixCls}-list-wrap`]: props.wrap && !nested,
              [`${props.prefixCls}-list-vertical`]: nested || props.vertical,
            },
          ]}
          style={nested ? mergedStyles.value.subList : mergedStyles.value.list}
        >
          {items.map((item, index) => {
            const itemHasChildren = hasChildren(item);
            const iconNode = renderItemNode(
              "iconRender",
              item,
              index,
              nested,
              item.icon,
            );
            const labelNode = renderItemNode(
              "labelRender",
              item,
              index,
              nested,
              item.label,
            );
            const descriptionNode = renderItemNode(
              "description",
              item,
              index,
              nested,
              item.description,
            );

            return (
              <div
                {...getItemDomAttrs(item)}
                key={item.key ?? `key-${index}`}
                class={[
                  `${props.prefixCls}-item`,
                  nested
                    ? mergedClasses.value.subItem
                    : mergedClasses.value.item,
                  item.class,
                  {
                    [`${props.prefixCls}-item-disabled`]: item.disabled,
                    [`${props.prefixCls}-item-has-nest`]: itemHasChildren,
                  },
                ]}
                style={[
                  nested ? mergedStyles.value.subItem : mergedStyles.value.item,
                  item.style,
                ]}
                onClick={() => triggerItemClick(item, nested)}
              >
                {hasRenderableNode(iconNode) && (
                  <div class={`${props.prefixCls}-icon`}>{iconNode}</div>
                )}
                <div
                  class={[
                    `${props.prefixCls}-content`,
                    mergedClasses.value.itemContent,
                  ]}
                  style={mergedStyles.value.itemContent}
                >
                  {hasRenderableNode(labelNode) && (
                    <div class={`${props.prefixCls}-label`}>{labelNode}</div>
                  )}
                  {hasRenderableNode(descriptionNode) && (
                    <div class={`${props.prefixCls}-desc`}>
                      {descriptionNode}
                    </div>
                  )}
                  {itemHasChildren && (
                    <div class={`${props.prefixCls}-nested`}>
                      {renderItems(item.children, true)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return () => (
      <div
        ref={rootRef}
        {...domAttrs.value}
        class={[
          props.prefixCls,
          contextConfig.value.classes?.root,
          props.rootClass,
          props.classes?.root,
          hashId.value,
          cssVarCls.value,
          attrs.class,
          props.class,
          motionClass.value,
          {
            [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
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
        {hasRenderableNode(renderTitle()) && (
          <div
            class={[`${props.prefixCls}-title`, mergedClasses.value.title]}
            style={mergedStyles.value.title}
          >
            {renderTitle()}
          </div>
        )}
        {renderItems(props.items)}
      </div>
    );
  },
});

export default XPrompts;
