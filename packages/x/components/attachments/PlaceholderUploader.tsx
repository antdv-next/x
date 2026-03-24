import type { UploadProps } from "antdv-next";
import type { ClassValue, PropType, StyleValue, VNodeChild } from "vue";

import { Upload } from "antdv-next";
import { computed, defineComponent, inject, isVNode, ref } from "vue";

import { AttachmentContextKey } from "./context";

export interface PlaceholderConfig {
  icon?: VNodeChild;
  title?: VNodeChild;
  description?: VNodeChild;
}

export type PlaceholderType = PlaceholderConfig | VNodeChild;

export interface PlaceholderProps {
  prefixCls: string;
  placeholder?: PlaceholderType;
  upload?: UploadProps;
  class?: ClassValue;
  style?: StyleValue;
}

const PlaceholderUploader = defineComponent({
  name: "XPlaceholderUploader",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    placeholder: {
      type: [
        String,
        Number,
        Object,
        Array,
        Function,
      ] as PropType<PlaceholderType>,
      default: undefined,
    },
    upload: {
      type: Object as PropType<UploadProps>,
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
    const context = inject(AttachmentContextKey, {});

    const dragIn = ref(false);
    const placeholderCls = computed(() => `${props.prefixCls}-placeholder`);

    const disabled = computed(() => {
      const disabledValue = context.disabled;
      return typeof disabledValue === "boolean"
        ? disabledValue
        : (disabledValue?.value ?? false);
    });

    const isConfig = computed(() => {
      const placeholder = props.placeholder;
      return (
        !!placeholder &&
        typeof placeholder === "object" &&
        !Array.isArray(placeholder) &&
        !isVNode(placeholder)
      );
    });

    const placeholderConfig = computed<PlaceholderConfig>(() => {
      if (!isConfig.value) return {};
      return props.placeholder as PlaceholderConfig;
    });

    const onDragEnter = () => {
      dragIn.value = true;
    };

    const onDragLeave = (e: DragEvent) => {
      const currentTarget = e.currentTarget as HTMLElement;
      if (!currentTarget.contains(e.relatedTarget as HTMLElement)) {
        dragIn.value = false;
      }
    };

    const onDrop = () => {
      dragIn.value = false;
    };

    return () => {
      const node = isConfig.value ? (
        <div class={`${placeholderCls.value}-inner`}>
          <span class={`${placeholderCls.value}-icon`}>
            {placeholderConfig.value.icon}
          </span>
          <span class={`${placeholderCls.value}-title`}>
            {placeholderConfig.value.title}
          </span>
          <span class={`${placeholderCls.value}-description`}>
            {placeholderConfig.value.description}
          </span>
        </div>
      ) : (
        slots.default?.() || props.placeholder
      );

      return (
        <div
          class={[
            placeholderCls.value,
            {
              [`${placeholderCls.value}-drag-in`]: dragIn.value,
              [`${placeholderCls.value}-disabled`]: disabled.value,
            },
            props.class,
            attrs.class,
          ]}
          style={[props.style, attrs.style as StyleValue]}
          onDragenter={onDragEnter}
          onDragleave={onDragLeave}
          onDrop={onDrop}
          aria-hidden={disabled.value}
        >
          <Upload.Dragger
            {...props.upload}
            {...attrs}
            showUploadList={false}
            style={{ padding: 0, border: 0, background: "transparent" }}
          >
            {node}
          </Upload.Dragger>
        </div>
      );
    };
  },
});

export default PlaceholderUploader;
