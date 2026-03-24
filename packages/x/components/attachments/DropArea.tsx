import type { ClassValue, PropType, StyleValue, VNodeChild } from "vue";

import {
  Teleport,
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  watch,
} from "vue";

import { AttachmentContextKey } from "./context";

export interface DropUploaderProps {
  prefixCls: string;
  class?: ClassValue;
  style?: StyleValue;
  getDropContainer?: null | (() => HTMLElement | null | undefined);
  children?: VNodeChild;
}

export default defineComponent({
  name: "XDropArea",
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    getDropContainer: {
      type: Function as unknown as PropType<
        DropUploaderProps["getDropContainer"]
      >,
      default: null,
    },
  },
  setup(props, { slots }) {
    const context = inject(AttachmentContextKey, {});

    const container = ref<HTMLElement | null>();
    const showArea = ref(false);

    const refreshContainer = () => {
      container.value = props.getDropContainer?.() ?? null;
    };

    onMounted(refreshContainer);

    watch(
      () => props.getDropContainer,
      () => {
        refreshContainer();
      },
    );

    const onDragEnter = () => {
      refreshContainer();
      if (container.value) showArea.value = true;
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const onDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) showArea.value = false;
    };

    const onDrop = (e: DragEvent) => {
      showArea.value = false;
      e.preventDefault();
    };

    watch(
      () => !!container.value,
      (hasContainer, _prev, onCleanup) => {
        if (!hasContainer) return;
        document.addEventListener("dragenter", onDragEnter);
        document.addEventListener("dragover", onDragOver);
        document.addEventListener("dragleave", onDragLeave);
        document.addEventListener("drop", onDrop);

        onCleanup(() => {
          document.removeEventListener("dragenter", onDragEnter);
          document.removeEventListener("dragover", onDragOver);
          document.removeEventListener("dragleave", onDragLeave);
          document.removeEventListener("drop", onDrop);
        });
      },
      { immediate: true },
    );

    const disabled = computed(() => {
      const disabledValue = context.disabled;
      return typeof disabledValue === "boolean"
        ? disabledValue
        : (disabledValue?.value ?? false);
    });

    const showDropdown = computed(
      () => !!props.getDropContainer && !!container.value && !disabled.value,
    );

    const areaCls = computed(() => `${props.prefixCls}-drop-area`);

    return () => {
      if (!showDropdown.value || !container.value) return null;

      return (
        <Teleport to={container.value}>
          <div
            class={[
              areaCls.value,
              props.class,
              {
                [`${areaCls.value}-on-body`]:
                  container.value?.tagName === "BODY",
              },
            ]}
            style={[
              props.style,
              {
                display: showArea.value ? "block" : "none",
              },
            ]}
          >
            {slots.default?.()}
          </div>
        </Teleport>
      );
    };
  },
});
