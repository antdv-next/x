import type { ButtonProps } from "antdv-next";
import type { CSSProperties, PropType, StyleValue, VNodeChild } from "vue";

import { Button } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { useSenderContext } from "./context";

type SwitchSemanticType = "root" | "content" | "icon" | "title";

export default defineComponent({
  name: "AxSenderSwitch",
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, default: undefined },
    rootClass: { type: String, default: undefined },
    class: { type: String, default: undefined },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    checkedChildren: {
      type: [String, Object] as PropType<VNodeChild>,
      default: undefined,
    },
    unCheckedChildren: {
      type: [String, Object] as PropType<VNodeChild>,
      default: undefined,
    },
    value: { type: Boolean, default: undefined },
    defaultValue: { type: Boolean, default: false },
    icon: { type: Object as PropType<VNodeChild>, default: undefined },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    onChange: {
      type: Function as PropType<(checked: boolean) => void>,
      default: undefined,
    },
    classNames: {
      type: Object as PropType<Partial<Record<SwitchSemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<
        Partial<Record<SwitchSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
  },
  setup(props, { expose, slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const senderCtx = useSenderContext();
    const contextConfig = useXComponentConfig("sender");

    const prefixCls = computed(() => {
      const ctxPrefix = senderCtx.value.prefixCls;
      return (
        configCtx.value.getPrefixCls?.(
          "sender",
          props.prefixCls ?? ctxPrefix,
        ) ??
        props.prefixCls ??
        ctxPrefix ??
        "antd-sender"
      );
    });

    const switchCls = computed(() => `${prefixCls.value}-switch`);
    const direction = computed(() => configCtx.value.direction);

    const containerRef = ref<HTMLDivElement>();
    const innerChecked = ref(props.defaultValue);

    watch(
      () => props.value,
      val => {
        if (val !== undefined) innerChecked.value = val;
      },
      { immediate: true },
    );

    const mergedChecked = computed(() => props.value ?? innerChecked.value);

    expose({
      get nativeElement() {
        return containerRef.value;
      },
    });

    return () => {
      const cls = switchCls.value;
      const iconNode = slots.icon?.() ?? props.icon;
      const checkedChildrenNode =
        slots.checkedChildren?.() ?? props.checkedChildren;
      const unCheckedChildrenNode =
        slots.unCheckedChildren?.() ?? props.unCheckedChildren;

      return (
        <div
          ref={containerRef}
          class={[
            prefixCls.value,
            cls,
            props.class,
            props.rootClass,
            contextConfig.value.classes?.switch,
            senderCtx.value.classNames?.switch,
            props.classNames.root,
            {
              [`${cls}-checked`]: mergedChecked.value,
              [`${cls}-rtl`]: direction.value === "rtl",
            },
          ]}
          style={[
            props.style,
            contextConfig.value.styles?.switch,
            senderCtx.value.styles?.switch,
            props.styles.root,
          ]}
          {...attrs}
        >
          <Button
            disabled={props.disabled}
            loading={props.loading}
            class={[`${cls}-content`, props.classNames.content]}
            style={props.styles.content as any}
            {...{
              classes: {
                icon: props.classNames.icon,
                content: props.classNames.title,
              },
              styles: {
                icon: props.styles.icon,
                content: props.styles.title,
              },
            }}
            variant="outlined"
            color={
              mergedChecked.value
                ? ("primary" as ButtonProps["color"])
                : ("default" as ButtonProps["color"])
            }
            icon={iconNode as any}
            onClick={() => {
              const newValue = !mergedChecked.value;
              innerChecked.value = newValue;
              props.onChange?.(newValue);
            }}
          >
            {mergedChecked.value ? checkedChildrenNode : unCheckedChildrenNode}
            {slots.default?.()}
          </Button>
        </div>
      );
    };
  },
});
