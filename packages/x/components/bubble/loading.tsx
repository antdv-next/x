import { defineComponent } from "vue";

export default defineComponent({
  name: "XBubbleLoading",
  props: {
    prefixCls: {
      type: String,
      default: "antd-bubble",
    },
  },
  setup(props) {
    return () => (
      <span class={`${props.prefixCls}-dot`}>
        <i class={`${props.prefixCls}-dot-item`} />
        <i class={`${props.prefixCls}-dot-item`} />
        <i class={`${props.prefixCls}-dot-item`} />
      </span>
    );
  },
});
