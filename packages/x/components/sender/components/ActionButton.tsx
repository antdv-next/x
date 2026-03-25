import type { ButtonProps } from "antdv-next";
import type { ComputedRef, InjectionKey, PropType, VNodeChild } from "vue";

import { Button } from "antdv-next";
import { computed, defineComponent, inject, provide } from "vue";

export interface ActionButtonContextProps {
  prefixCls: string;
  onSend?: () => void;
  onSendDisabled?: boolean;
  onClear?: () => void;
  onClearDisabled?: boolean;
  onCancel?: () => void;
  onCancelDisabled?: boolean;
  onSpeech?: () => void;
  onSpeechDisabled?: boolean;
  speechRecording?: boolean;
  disabled?: boolean;
}

export const ActionButtonContextKey: InjectionKey<
  ComputedRef<ActionButtonContextProps>
> = Symbol("action-button-context");

export function useActionButtonContext() {
  return inject(
    ActionButtonContextKey,
    computed(
      () =>
        ({
          prefixCls: "",
        }) as ActionButtonContextProps,
    ),
  );
}

export function provideActionButtonContext(
  value: ComputedRef<ActionButtonContextProps>,
) {
  provide(ActionButtonContextKey, value);
}

export type ActionType = "onSend" | "onClear" | "onCancel" | "onSpeech";

const ActionButton = defineComponent({
  name: "ActionButton",
  inheritAttrs: false,
  props: {
    action: {
      type: String as PropType<ActionType>,
      required: true,
    },
    disabled: { type: Boolean, default: undefined },
    icon: { type: Object, default: undefined },
    type: { type: String as PropType<ButtonProps["type"]>, default: "text" },
    shape: {
      type: String as PropType<ButtonProps["shape"]>,
      default: undefined,
    },
    color: {
      type: String as PropType<ButtonProps["color"]>,
      default: undefined,
    },
    variant: {
      type: String as PropType<ButtonProps["variant"]>,
      default: undefined,
    },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const context = useActionButtonContext();

    const mergedDisabled = computed(() => {
      if (props.disabled !== undefined) return props.disabled;
      if (context.value.disabled) return true;
      const disabledKey =
        `${props.action}Disabled` as keyof ActionButtonContextProps;
      return (context.value[disabledKey] as boolean) ?? false;
    });

    return () => {
      const { prefixCls } = context.value;

      return (
        <Button
          type={props.type}
          shape={props.shape}
          color={props.color}
          variant={props.variant}
          {...attrs}
          icon={props.icon as any}
          disabled={mergedDisabled.value}
          class={[
            prefixCls,
            props.class,
            { [`${prefixCls}-disabled`]: mergedDisabled.value },
          ]}
          onClick={(e: MouseEvent) => {
            if (mergedDisabled.value) return;
            const handler = context.value[props.action];
            if (typeof handler === "function") {
              (handler as () => void)();
            }
            (attrs.onClick as any)?.(e);
          }}
        />
      );
    };
  },
});

export default ActionButton;
