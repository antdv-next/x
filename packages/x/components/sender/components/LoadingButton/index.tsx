import { classNames } from "@v-c/util";
import { defineComponent } from "vue";

import ActionButton, { useActionButtonContext } from "../ActionButton";
import StopLoadingIcon from "./StopLoading";

export default defineComponent({
  name: "LoadingButton",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const context = useActionButtonContext();

    return () => {
      const { prefixCls } = context.value;

      return (
        <ActionButton
          icon={<StopLoadingIcon class={`${prefixCls}-loading-icon`} />}
          color="primary"
          variant="text"
          shape="circle"
          {...attrs}
          class={classNames([
            attrs.class as string,
            `${prefixCls}-loading-button`,
          ])}
          action="onCancel"
        />
      );
    };
  },
});
