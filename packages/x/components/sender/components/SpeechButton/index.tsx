import { AudioMutedOutlined, AudioOutlined } from "@antdv-next/icons";
import type { VNodeChild } from "vue";
import { computed, defineComponent } from "vue";

import ActionButton, { useActionButtonContext } from "../ActionButton";
import RecordingIcon from "./RecordingIcon";

export default defineComponent({
  name: "SpeechButton",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const context = useActionButtonContext();

    const mergedDisabled = computed(() => {
      return (
        (attrs.disabled as boolean) ??
        context.value.disabled ??
        context.value.onSpeechDisabled
      );
    });

    const icon = computed<VNodeChild>(() => {
      const { speechRecording, prefixCls } = context.value;
      if (speechRecording) {
        return <RecordingIcon class={`${prefixCls}-recording-icon`} />;
      }
      if (mergedDisabled.value) {
        return <AudioMutedOutlined />;
      }
      return <AudioOutlined />;
    });

    return () => (
      <ActionButton
        icon={icon.value}
        variant="text"
        color="primary"
        {...attrs}
        action="onSpeech"
      />
    );
  },
});
