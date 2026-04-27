import type { PropType, StyleValue } from "vue";
import type { CSSProperties } from "vue";

import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import type { SlotTextAreaRef } from "./components/SlotTextArea";
import type { TextAreaRef } from "./components/TextArea";
import type {
  AllowSpeech,
  BaseNode,
  InsertPosition,
  NodeRender,
  SenderFocusOptions,
  SenderRef,
  SkillType,
  SlotConfigType,
  SubmitType,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import {
  type ActionButtonContextProps,
  provideActionButtonContext,
} from "./components/ActionButton";
import ClearButton from "./components/ClearButton";
import LoadingButton from "./components/LoadingButton";
import SendButton from "./components/SendButton";
import SlotTextArea from "./components/SlotTextArea";
import SpeechButton from "./components/SpeechButton";
import TextArea from "./components/TextArea";
import { provideSenderContext } from "./context";
import useSpeech from "./hooks/use-speech";
import useStyle from "./style";

const sharedRenderComponents = {
  SendButton,
  ClearButton,
  LoadingButton,
  SpeechButton,
};

export default defineComponent({
  name: "AxSender",
  inheritAttrs: false,
  props: {
    prefixCls: { type: String, default: "antd-sender" },
    rootClass: { type: String, default: undefined },
    class: { type: String, default: undefined },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    defaultValue: { type: String, default: "" },
    value: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    submitType: {
      type: String as PropType<SubmitType>,
      default: "enter",
    },
    disabled: { type: Boolean, default: false },
    slotConfig: {
      type: Array as PropType<Readonly<SlotConfigType[]>>,
      default: undefined,
    },
    skill: {
      type: Object as PropType<SkillType>,
      default: undefined,
    },
    placeholder: { type: String, default: undefined },
    allowSpeech: {
      type: [Boolean, Object] as PropType<AllowSpeech>,
      default: undefined,
    },
    autoSize: {
      type: [Boolean, Object] as PropType<
        boolean | { minRows?: number; maxRows?: number }
      >,
      default: () => ({ maxRows: 8 }),
    },
    classNames: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<Record<string, CSSProperties>>,
      default: () => ({}),
    },
    prefix: {
      type: [Object, Function, Boolean] as PropType<BaseNode | NodeRender>,
      default: undefined,
    },
    suffix: {
      type: [Object, Function, Boolean] as PropType<BaseNode | NodeRender>,
      default: undefined,
    },
    header: {
      type: [Object, Function, Boolean] as PropType<BaseNode | NodeRender>,
      default: undefined,
    },
    footer: {
      type: [Object, Function, Boolean] as PropType<BaseNode | NodeRender>,
      default: undefined,
    },
    onSubmit: {
      type: Function as PropType<
        (
          message: string,
          slotConfig?: SlotConfigType[],
          skill?: SkillType,
        ) => void
      >,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<
        (
          value: string,
          event?: Event,
          slotConfig?: SlotConfigType[],
          skill?: SkillType,
        ) => void
      >,
      default: undefined,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    onKeyDown: {
      type: Function as PropType<(event: KeyboardEvent) => void | false>,
      default: undefined,
    },
    onKeyUp: {
      type: Function as PropType<(event: KeyboardEvent) => void>,
      default: undefined,
    },
    onPaste: {
      type: Function as PropType<(event: ClipboardEvent) => void>,
      default: undefined,
    },
    onPasteFile: {
      type: Function as PropType<(files: FileList) => void>,
      default: undefined,
    },
    onFocus: {
      type: Function as PropType<(event: FocusEvent) => void>,
      default: undefined,
    },
    onBlur: {
      type: Function as PropType<(event: FocusEvent) => void>,
      default: undefined,
    },
  },
  setup(props, { expose, slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("sender");

    const prefixCls = computed(
      () =>
        configCtx.value.getPrefixCls?.("sender", props.prefixCls) ??
        props.prefixCls,
    );
    const direction = computed(() => configCtx.value.direction);

    // Styles
    const [hashId, cssVarCls] = useStyle(prefixCls);

    const containerRef = ref<HTMLDivElement>();
    const inputRef = ref<TextAreaRef | SlotTextAreaRef>();
    const isSlotMode = computed(
      () => Array.isArray(props.slotConfig) || !!props.skill?.value,
    );

    // Value
    const innerValue = ref(props.defaultValue);
    const mergedValue = computed(() => props.value ?? innerValue.value);

    const triggerValueChange = (
      nextValue: string,
      event?: Event,
      slotConfig?: SlotConfigType[],
      skill?: SkillType,
    ) => {
      innerValue.value = nextValue;
      props.onChange?.(nextValue, event, slotConfig, skill);
    };

    const submitDisabled = ref(!mergedValue.value);

    watch(
      () => mergedValue.value,
      next => {
        if (!isSlotMode.value) {
          submitDisabled.value = !next;
        }
      },
      { immediate: true },
    );

    // Speech
    const [speechPermission, triggerSpeech, speechRecording] = useSpeech(
      transcript => {
        if (isSlotMode.value) {
          (inputRef.value as SlotTextAreaRef | undefined)?.insert?.([
            {
              type: "text",
              value: transcript,
            },
          ]);
          return;
        }

        triggerValueChange(`${mergedValue.value} ${transcript}`);
      },
      () => props.allowSpeech,
    );

    // Events
    const triggerSend = () => {
      if (!props.onSubmit || props.loading || submitDisabled.value) {
        return;
      }

      const value = inputRef.value?.getValue?.() ?? { value: "" };
      const slotConfig =
        "slotConfig" in value
          ? (value as { slotConfig?: SlotConfigType[] }).slotConfig
          : undefined;
      const skill =
        "skill" in value ? (value as { skill?: SkillType }).skill : undefined;
      props.onSubmit(value.value, slotConfig, skill);
    };

    const triggerClear = () => {
      if (inputRef.value?.clear) {
        inputRef.value.clear();
        return;
      }
      triggerValueChange("");
    };

    // Expose
    expose<SenderRef>({
      get nativeElement() {
        return containerRef.value as HTMLDivElement;
      },
      focus(options?: SenderFocusOptions) {
        inputRef.value?.focus(options);
      },
      blur() {
        inputRef.value?.blur();
      },
      clear() {
        triggerClear();
      },
      insert(text, position?: InsertPosition) {
        if (isSlotMode.value) {
          const slotList = Array.isArray(text)
            ? text
            : ([{ type: "text", value: text }] as SlotConfigType[]);
          (inputRef.value as SlotTextAreaRef | undefined)?.insert?.(
            slotList,
            position,
          );
          return;
        }

        const textValue = Array.isArray(text)
          ? text
              .map(config => {
                if (config.type === "text") return config.value ?? "";
                return (
                  config.formatResult?.((config as any).props?.defaultValue) ??
                  ""
                );
              })
              .join("")
          : text;
        (inputRef.value as TextAreaRef | undefined)?.insert?.(
          textValue,
          position,
        );
      },
      getValue() {
        return inputRef.value?.getValue() ?? { value: "" };
      },
    });

    // Context
    provideSenderContext(
      computed(() => ({
        value: mergedValue.value,
        onChange: triggerValueChange,
        onKeyUp: props.onKeyUp,
        onKeyDown: props.onKeyDown,
        onPaste: props.onPaste,
        onPasteFile: props.onPasteFile,
        disabled: props.disabled,
        readOnly: props.readOnly,
        submitType: props.submitType,
        prefixCls: prefixCls.value,
        styles: props.styles,
        classNames: props.classNames,
        autoSize: props.autoSize,
        triggerSend,
        placeholder: props.placeholder,
        onFocus: props.onFocus,
        onBlur: props.onBlur,
        slotConfig: props.slotConfig,
        skill: props.skill,
        setSubmitDisabled: (disabled: boolean) => {
          submitDisabled.value = disabled;
        },
      })),
    );

    // Action Button Context
    const actionBtnCls = computed(() => `${prefixCls.value}-actions-btn`);

    provideActionButtonContext(
      computed<ActionButtonContextProps>(() => ({
        prefixCls: actionBtnCls.value,
        onSend: triggerSend,
        onSendDisabled: submitDisabled.value,
        onClear: triggerClear,
        onClearDisabled: submitDisabled.value,
        onCancel: props.onCancel,
        onCancelDisabled: !props.loading,
        onSpeech: () => triggerSpeech(false),
        onSpeechDisabled: !speechPermission.value,
        speechRecording: speechRecording.value,
        disabled: props.disabled,
      })),
    );

    // Render helpers
    const renderNode = (
      node: BaseNode | NodeRender | undefined,
      slotName: "prefix" | "suffix" | "header" | "footer",
      defaultNode: any,
    ) => {
      if (slots[slotName]) {
        return slots[slotName]?.({
          defaultNode,
          components: sharedRenderComponents,
        });
      }

      if (typeof node === "function") {
        return (node as NodeRender)(defaultNode, {
          components: sharedRenderComponents as any,
        });
      }
      if (node || node === false) return node;
      return null;
    };

    return () => {
      const cls = prefixCls.value;
      const actionListCls = `${cls}-actions-list`;

      const actionNode = (
        <div class={`${actionListCls}-presets`}>
          {props.allowSpeech && <SpeechButton />}
          {props.loading ? <LoadingButton /> : <SendButton />}
        </div>
      );

      const suffixNode =
        renderNode(props.suffix, "suffix", actionNode) ?? actionNode;
      const prefixNode = renderNode(props.prefix, "prefix", actionNode);
      const headerNode = renderNode(props.header, "header", actionNode);
      const footerNode = renderNode(props.footer, "footer", actionNode);

      return (
        <div
          ref={containerRef}
          class={[
            cls,
            contextConfig.value.classes?.root,
            props.class,
            props.rootClass,
            props.classNames.root,
            hashId.value,
            cssVarCls.value,
            `${cls}-main`,
            {
              [`${cls}-rtl`]: direction.value === "rtl",
              [`${cls}-disabled`]: props.disabled,
            },
          ]}
          style={[
            contextConfig.value.style,
            props.style,
            contextConfig.value.styles?.root,
            props.styles.root,
          ]}
          {...attrs}
        >
          {/* Header */}
          {headerNode}

          {/* Content */}
          <div
            class={[`${cls}-content`, props.classNames.content]}
            style={props.styles.content}
            onMousedown={(e: MouseEvent) => {
              const inputNode = containerRef.value?.querySelector(
                `.${cls}-input`,
              );
              if (!isSlotMode.value && e.target !== inputNode) {
                e.preventDefault();
              }
              if (e.target === inputNode || e.target === containerRef.value) {
                inputRef.value?.focus();
              }
            }}
          >
            {/* Prefix */}
            {prefixNode && (
              <div
                class={[
                  `${cls}-prefix`,
                  contextConfig.value.classes?.prefix,
                  props.classNames.prefix,
                ]}
                style={[
                  contextConfig.value.styles?.prefix,
                  props.styles.prefix,
                ]}
              >
                {prefixNode}
              </div>
            )}

            {/* Input */}
            {isSlotMode.value ? (
              <SlotTextArea ref={inputRef as any} />
            ) : (
              <TextArea ref={inputRef as any} />
            )}

            {/* Suffix */}
            {suffixNode && (
              <div
                class={[
                  actionListCls,
                  contextConfig.value.classes?.suffix,
                  props.classNames.suffix,
                ]}
                style={[
                  contextConfig.value.styles?.suffix,
                  props.styles.suffix,
                ]}
              >
                {suffixNode}
              </div>
            )}
          </div>

          {/* Footer */}
          {footerNode && (
            <div
              class={[
                `${cls}-footer`,
                contextConfig.value.classes?.footer,
                props.classNames.footer,
              ]}
              style={[contextConfig.value.styles?.footer, props.styles.footer]}
            >
              {footerNode}
            </div>
          )}
        </div>
      );
    };
  },
});
