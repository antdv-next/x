import { ArrowUpOutlined } from "@antdv-next/icons";
import { defineComponent } from "vue";

import ActionButton from "./ActionButton";

export default defineComponent({
  name: "SendButton",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => (
      <ActionButton
        icon={<ArrowUpOutlined />}
        type="primary"
        shape="circle"
        {...attrs}
        action="onSend"
      />
    );
  },
});
