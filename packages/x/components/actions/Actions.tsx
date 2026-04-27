import type { CSSProperties, PropType, StyleValue, TransitionProps } from "vue";

import { useConfig } from "antdv-next/config-provider/context";
import {
  computed,
  defineComponent,
  ref,
  Transition,
  useAttrs,
  useSlots,
} from "vue";

import type {
  ActionsItemSlotInfo,
  ActionsProps,
  ActionsRef,
  ItemType,
  SemanticType,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { isEmptyNode } from "../_utils/vue";
import Item from "./Item";
import useActionsStyle from "./style";

function getMotionTransitionProps(motionName: string): TransitionProps {
  return {
    name: motionName,
    appear: true,
    enterFromClass: `${motionName} ${motionName}-enter ${motionName}-appear ${motionName}-appear-prepare ${motionName}-enter-prepare ${motionName}-enter-start`,
    enterActiveClass: `${motionName} ${motionName}-enter ${motionName}-appear ${motionName}-appear-prepare ${motionName}-enter-prepare`,
    enterToClass: `${motionName} ${motionName}-enter ${motionName}-appear ${motionName}-appear-active ${motionName}-enter-active`,
    leaveFromClass: `${motionName} ${motionName}-leave`,
    leaveActiveClass: `${motionName} ${motionName}-leave ${motionName}-leave-active`,
    leaveToClass: `${motionName} ${motionName}-leave ${motionName}-leave-active`,
  };
}

export const XActions = defineComponent({
  name: "AxActions",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ItemType[]>,
      default: () => [],
    },
    onClick: {
      type: Function as PropType<ActionsProps["onClick"]>,
      default: undefined,
    },
    dropdownProps: {
      type: Object as PropType<ActionsProps["dropdownProps"]>,
      default: undefined,
    },
    variant: {
      type: String as PropType<"borderless" | "filled" | "outlined">,
      default: "borderless",
    },
    prefixCls: {
      type: String,
      default: "antd-actions",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<ActionsProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
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
  setup(props, { expose }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const slots = useSlots();
    const contextConfig = useXComponentConfig("actions");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useActionsStyle(
      computed(() => props.prefixCls),
    );
    const rootPrefixCls = computed(() => configCtx.value.getPrefixCls());
    const motionName = computed(() => {
      if (!props.fadeIn && !props.fadeInLeft) return "";
      return `${rootPrefixCls.value}-x-fade${props.fadeInLeft ? "-left" : ""}`;
    });
    const transitionProps = computed(() => {
      if (!motionName.value) return null;
      return getMotionTransitionProps(motionName.value);
    });

    expose<ActionsRef>({
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

    const getNamedSlot = (name: "iconRender" | "actionRender") =>
      slots[name] ?? slots[name.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)];

    const renderList = () => (
      <div
        class={[
          `${props.prefixCls}-list`,
          `${props.prefixCls}-variant-${props.variant}`,
        ]}
      >
        {props.items.map((item, idx) => {
          const slotInfo: ActionsItemSlotInfo = {
            item,
            index: idx,
            originNode: item.icon,
          };
          const slottedIcon = getNamedSlot("iconRender")?.(slotInfo);
          const slotActionNode = getNamedSlot("actionRender")?.({
            item,
            index: idx,
            originNode:
              item.actionRender !== undefined
                ? typeof item.actionRender === "function"
                  ? item.actionRender(item)
                  : item.actionRender
                : undefined,
          });

          const mergedItem: ItemType = {
            ...item,
            icon:
              slottedIcon !== undefined && !isEmptyNode(slottedIcon)
                ? slottedIcon
                : item.icon,
            actionRender:
              slotActionNode !== undefined && !isEmptyNode(slotActionNode)
                ? slotActionNode
                : item.actionRender,
          };

          return (
            <Item
              key={item.key ?? idx}
              item={mergedItem}
              onClick={props.onClick}
              dropdownProps={props.dropdownProps}
              prefixCls={props.prefixCls}
              classes={mergedClasses.value}
              styles={mergedStyles.value}
            />
          );
        })}
      </div>
    );

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
        {transitionProps.value ? (
          <Transition {...transitionProps.value}>{renderList()}</Transition>
        ) : (
          renderList()
        )}
      </div>
    );
  },
});

export default XActions;
