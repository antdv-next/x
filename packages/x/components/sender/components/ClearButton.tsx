import { ClearOutlined } from "@antdv-next/icons";
import { defineComponent } from "vue";

import ActionButton from "./ActionButton";

export default defineComponent({
  name: "ClearButton",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => (
      <ActionButton icon={<ClearOutlined />} {...attrs} action="onClear">
        {slots}
      </ActionButton>
    );
  },
});
