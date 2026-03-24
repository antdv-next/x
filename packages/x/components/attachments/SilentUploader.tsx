import type { UploadProps } from "antdv-next";
import type { ClassValue, PropType, StyleValue, VNodeChild } from "vue";

import { Upload } from "antdv-next";
import { defineComponent, ref } from "vue";

export interface SilentUploaderProps {
  children?: VNodeChild;
  upload: UploadProps;
  visible?: boolean;
  class?: ClassValue;
  style?: StyleValue;
}

/**
 * SilentUploader only wraps children with Upload.
 */
const SilentUploader = defineComponent({
  name: "XSilentUploader",
  inheritAttrs: false,
  props: {
    upload: {
      type: Object as PropType<UploadProps>,
      default: () => ({}) as UploadProps,
    },
    visible: {
      type: Boolean,
      default: undefined,
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const uploadRef = ref<any>();

    return () => (
      <Upload
        {...props.upload}
        {...attrs}
        showUploadList={false}
        class={[props.class, attrs.class]}
        style={[
          props.style,
          props.visible === false ? { display: "none" } : null,
          attrs.style,
        ]}
        ref={uploadRef}
      >
        {slots.default?.()}
      </Upload>
    );
  },
});

export default SilentUploader;
