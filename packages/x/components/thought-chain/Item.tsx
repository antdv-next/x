import type { CSSProperties, PropType, VNodeChild } from "vue";

import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref } from "vue";

import type {
  ThoughtChainItemSemanticType,
  ThoughtChainItemStatus,
} from "./interface";

import Status from "./Status";
import useThoughtChainStyle from "./style";

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
  setup(props, { expose }) {
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
          {(props.icon || props.status) && (
            <Status
              style={props.styles?.icon}
              class={props.classes?.icon}
              prefixCls={props.prefixCls}
              icon={props.icon}
              status={props.status}
            />
          )}

          {/* Content */}
          {(props.title || props.description) && (
            <div
              class={[
                `${cls}-content`,
                { [`${props.prefixCls}-motion-blink`]: props.blink },
              ]}
            >
              {props.title && (
                <div
                  class={[
                    `${cls}-title`,
                    props.classes?.title,
                    {
                      [`${cls}-title-with-description`]: !!props.description,
                    },
                  ]}
                  style={props.styles?.title}
                >
                  {props.title}
                </div>
              )}
              {props.description && (
                <div
                  class={[`${cls}-description`, props.classes?.description]}
                  style={props.styles?.description}
                >
                  {props.description}
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
