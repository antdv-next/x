import type { VNodeChild } from "vue";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  MinusCircleOutlined,
} from "@antdv-next/icons";
import { defineComponent } from "vue";

import type { ThoughtChainItemStatus } from "./interface";

const STATUS_ICON_MAP: Record<ThoughtChainItemStatus, VNodeChild> = {
  loading: <LoadingOutlined />,
  success: <CheckCircleOutlined />,
  error: <CloseCircleOutlined />,
  abort: <MinusCircleOutlined />,
};

export default defineComponent({
  name: "ThoughtChainStatus",
  props: {
    status: {
      type: String as () => ThoughtChainItemStatus | undefined,
      default: undefined,
    },
    prefixCls: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!props.status) return null;

      return (
        <span
          class={[
            `${props.prefixCls}-status`,
            `${props.prefixCls}-status-${props.status}`,
          ]}
        >
          {STATUS_ICON_MAP[props.status]}
        </span>
      );
    };
  },
});
