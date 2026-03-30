import type { CSSProperties, PropType, VNodeChild } from "vue";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
} from "@antdv-next/icons";
import { defineComponent } from "vue";

import type { ThoughtChainItemStatus } from "./interface";

export const STATUS_ICON_MAP: Record<ThoughtChainItemStatus, VNodeChild> = {
  loading: <LoadingOutlined />,
  success: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  abort: <MinusCircleOutlined />,
};

export default defineComponent({
  name: "ThoughtChainStatus",
  props: {
    status: {
      type: String as PropType<ThoughtChainItemStatus | undefined>,
      default: undefined,
    },
    icon: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      required: true,
    },
    class: {
      type: [String, Array, Object] as PropType<any>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<CSSProperties>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      const iconNode = props.status
        ? STATUS_ICON_MAP[props.status]
        : props.icon;

      if (!iconNode) return null;

      const statusCls = `${props.prefixCls}-status`;

      return (
        <div
          class={[
            statusCls,
            props.class,
            { [`${statusCls}-${props.status}`]: props.status },
          ]}
          style={props.style}
        >
          {iconNode}
        </div>
      );
    };
  },
});
