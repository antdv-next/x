import { TextArea as ATextarea } from "antdv-next";
import { defineComponent, ref } from "vue";

import { useSenderContext } from "../context";

export type InsertPosition = "start" | "end" | "cursor";

export interface TextAreaRef {
  nativeElement: HTMLTextAreaElement | null;
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  clear: () => void;
  getValue: () => { value: string };
  insert: (text: string, position?: InsertPosition) => void;
}

export default defineComponent({
  name: "SenderTextArea",
  setup(_, { expose }) {
    const senderCtx = useSenderContext();
    const inputRef = ref<InstanceType<typeof ATextarea>>();
    const isComposing = ref(false);

    const getTextAreaEl = (): HTMLTextAreaElement | null => {
      return (inputRef.value as any)?.$el?.querySelector?.("textarea") ?? null;
    };

    expose<TextAreaRef>({
      get nativeElement() {
        return getTextAreaEl();
      },
      focus(options?: FocusOptions) {
        getTextAreaEl()?.focus(options);
      },
      blur() {
        getTextAreaEl()?.blur();
      },
      clear() {
        senderCtx.value.onChange?.("", undefined);
      },
      getValue() {
        return { value: senderCtx.value.value ?? "" };
      },
      insert(text: string, position: InsertPosition = "cursor") {
        const el = getTextAreaEl();
        const currentValue = senderCtx.value.value ?? "";
        let newValue: string;

        if (position === "start") {
          newValue = text + currentValue;
        } else if (position === "end") {
          newValue = currentValue + text;
        } else {
          const cursorPos = el?.selectionStart ?? currentValue.length;
          newValue =
            currentValue.slice(0, cursorPos) +
            text +
            currentValue.slice(cursorPos);
        }
        senderCtx.value.onChange?.(newValue, undefined);
      },
    });

    const onInternalKeyDown = (e: KeyboardEvent) => {
      const ctx = senderCtx.value;
      const eventRes = ctx.onKeyDown?.(e);
      const { key, shiftKey, ctrlKey, altKey, metaKey } = e;

      if (isComposing.value || key !== "Enter" || eventRes === false) {
        return;
      }

      const submitType = ctx.submitType ?? "enter";
      const isModifierPressed = ctrlKey || altKey || metaKey;
      const shouldSubmit =
        (submitType === "enter" && !shiftKey && !isModifierPressed) ||
        (submitType === "shiftEnter" && shiftKey && !isModifierPressed);

      if (shouldSubmit) {
        e.preventDefault();
        ctx.triggerSend?.();
      }
    };

    const onInternalPaste = (e: ClipboardEvent) => {
      const ctx = senderCtx.value;
      const files = e.clipboardData?.files;
      const text = e.clipboardData?.getData("text/plain");
      if (!text && files?.length && ctx.onPasteFile) {
        ctx.onPasteFile(files);
        e.preventDefault();
      }
      ctx.onPaste?.(e);
    };

    return () => {
      const ctx = senderCtx.value;

      return (
        <ATextarea
          ref={inputRef}
          disabled={ctx.disabled}
          style={ctx.styles?.input}
          class={[`${ctx.prefixCls}-input`, ctx.classNames?.input]}
          autoSize={ctx.autoSize}
          value={ctx.value}
          onChange={(e: Event) => {
            const target = e.target as HTMLTextAreaElement;
            ctx.onChange?.(target.value, e);
          }}
          onKeyup={ctx.onKeyUp}
          onCompositionstart={() => {
            isComposing.value = true;
          }}
          onCompositionend={() => {
            isComposing.value = false;
          }}
          onKeydown={onInternalKeyDown}
          {...{ onPaste: onInternalPaste }}
          variant="borderless"
          readonly={ctx.readOnly}
          placeholder={ctx.placeholder}
          onFocus={ctx.onFocus}
          onBlur={ctx.onBlur}
        />
      );
    };
  },
});
