import type { CSSProperties, PropType, VNodeChild } from "vue";

import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref } from "vue";

import type {
  ThoughtChainItemDescriptionSlotInfo,
  ThoughtChainItemIconSlotInfo,
  ThoughtChainItemSemanticType,
  ThoughtChainItemStatus,
  ThoughtChainItemTitleSlotInfo,
} from "./interface";

import { STATUS_ICON_MAP } from "./Status";
import useThoughtChainStyle from "./style";

function hasRenderableNode(node: VNodeChild | null | undefined) {
  if (Array.isArray(node)) {
    return node.some(
      item => item !== null && item !== undefined && item !== false,
    );
  }

  return node !== null && node !== undefined && node !== false;
}

export const XThoughtChainItem = defineComponent({
  name: "XThoughtChainItem",
  props: {
    prefixCls: {
      type: String,
      default: "antd-thought-chain",
    },
    rootClass: {
      type: String,
      default: "",
    },
    icon: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    title: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    description: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    status: {
      type: String as PropType<ThoughtChainItemStatus>,
      default: undefined,
    },
    variant: {
      type: String as PropType<"solid" | "outlined" | "text">,
      default: "solid",
    },
    blink: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function as PropType<(e: MouseEvent) => void>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<
        Partial<Record<ThoughtChainItemSemanticType, string>>
      >,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<
        Partial<Record<ThoughtChainItemSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
  },
  setup(props, { expose, slots }) {
    const configCtx = useConfig();
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useThoughtChainStyle(
      computed(() => props.prefixCls),
    );

    const itemPrefixCls = computed(() => `${props.prefixCls}-item`);

    function handleClick(e: MouseEvent) {
      if (props.disabled || !props.onClick) return;
      props.onClick(e);
    }

    expose({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    return () => {
      const cls = itemPrefixCls.value;
      const statusCls = `${props.prefixCls}-status`;
      const iconRenderSlot = slots.iconRender ?? slots["icon-render"];

      const originIconNode = props.status
        ? STATUS_ICON_MAP[props.status]
        : props.icon;
      const iconNode = iconRenderSlot
        ? iconRenderSlot({
            originNode: originIconNode,
            status: props.status,
          } as ThoughtChainItemIconSlotInfo)
        : originIconNode;
      const titleNode = slots.title
        ? slots.title({
            originNode: props.title,
          } as ThoughtChainItemTitleSlotInfo)
        : props.title;
      const descriptionNode = slots.description
        ? slots.description({
            originNode: props.description,
          } as ThoughtChainItemDescriptionSlotInfo)
        : props.description;
      const hasTitle = hasRenderableNode(titleNode);
      const hasDescription = hasRenderableNode(descriptionNode);

      return (
        <div
          ref={rootRef}
          class={[
            props.prefixCls,
            cls,
            `${cls}-${props.variant}`,
            props.rootClass,
            props.classes?.root,
            hashId.value,
            cssVarCls.value,
            {
              [`${cls}-click`]: !!props.onClick && !props.disabled,
              [`${cls}-error`]: props.status === "error",
              [`${cls}-disabled`]: props.disabled,
              [`${cls}-rtl`]: configCtx.value.direction === "rtl",
            },
          ]}
          style={props.styles?.root}
          onClick={handleClick}
        >
          {/* Icon */}
          {hasRenderableNode(iconNode) && (
            <div
              style={props.styles?.icon}
              class={[
                statusCls,
                props.classes?.icon,
                { [`${statusCls}-${props.status}`]: props.status },
              ]}
            >
              {iconNode}
            </div>
          )}

          {/* Content */}
          {(hasTitle || hasDescription) && (
            <div
              class={[
                `${cls}-content`,
                { [`${props.prefixCls}-motion-blink`]: props.blink },
              ]}
            >
              {hasTitle && (
                <div
                  class={[
                    `${cls}-title`,
                    props.classes?.title,
                    {
                      [`${cls}-title-with-description`]: hasDescription,
                    },
                  ]}
                  style={props.styles?.title}
                >
                  {titleNode}
                </div>
              )}
              {hasDescription && (
                <div
                  class={[`${cls}-description`, props.classes?.description]}
                  style={props.styles?.description}
                >
                  {descriptionNode}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
  },
});

export default XThoughtChainItem;
