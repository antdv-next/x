import type {
  ClassValue,
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import { CloseCircleOutlined, LoadingOutlined } from "@antdv-next/icons";
import { Tooltip } from "antdv-next";
import { computed, defineComponent, useAttrs, useSlots } from "vue";

import useActionsStyle from "./style";

export enum ACTIONS_ITEM_STATUS {
  LOADING = "loading",
  ERROR = "error",
  RUNNING = "running",
  DEFAULT = "default",
}

type SemanticType = "root" | "default" | "running" | "error" | "loading";

export interface ActionsItemProps {
  status?: `${ACTIONS_ITEM_STATUS}`;
  defaultIcon: VNodeChild;
  label?: string;
  runningIcon?: VNodeChild;
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
}

export const XActionsItem = defineComponent({
  name: "AxActionsItem",
  inheritAttrs: false,
  props: {
    status: {
      type: String as PropType<`${ACTIONS_ITEM_STATUS}`>,
      default: ACTIONS_ITEM_STATUS.DEFAULT,
    },
    defaultIcon: {
      type: [String, Number, Object, Array, Function] as PropType<VNodeChild>,
      required: true,
    },
    label: {
      type: String,
      default: undefined,
    },
    runningIcon: {
      type: [String, Number, Object, Array, Function] as PropType<VNodeChild>,
      default: undefined,
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
      type: [String, Array, Object] as PropType<ClassValue>,
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
  },
  setup(props) {
    const attrs = useAttrs();
    const slots = useSlots();
    const [hashId, cssVarCls] = useActionsStyle(
      computed(() => props.prefixCls),
    );
    const itemCls = `${props.prefixCls}-button-item`;

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const defaultIconSlot = computed(
      () => slots.defaultIcon ?? slots["default-icon"],
    );

    const runningIconSlot = computed(
      () => slots.runningIcon ?? slots["running-icon"],
    );

    const statusIcon = computed(() => {
      const defaultIconNode = defaultIconSlot.value?.() ?? props.defaultIcon;
      const runningIconNode = runningIconSlot.value?.() ?? props.runningIcon;
      const iconMap = {
        [ACTIONS_ITEM_STATUS.LOADING]: <LoadingOutlined />,
        [ACTIONS_ITEM_STATUS.ERROR]: <CloseCircleOutlined />,
        [ACTIONS_ITEM_STATUS.RUNNING]: runningIconNode,
        [ACTIONS_ITEM_STATUS.DEFAULT]: defaultIconNode,
      };

      return iconMap[props.status] ?? defaultIconNode;
    });

    return () => (
      <Tooltip title={props.label}>
        <div
          {...domAttrs.value}
          class={[
            itemCls,
            props.prefixCls,
            `${props.prefixCls}-item`,
            hashId.value,
            cssVarCls.value,
            props.rootClass,
            props.classes?.root,
            props.classes?.[props.status],
            attrs.class,
            props.class,
          ]}
          style={[
            props.styles?.root,
            props.styles?.[props.status],
            attrs.style as StyleValue,
            props.style,
          ]}
        >
          {statusIcon.value}
        </div>
      </Tooltip>
    );
  },
});

export default XActionsItem;
