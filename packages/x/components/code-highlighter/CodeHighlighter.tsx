import type { CSSProperties, PropType, SlotsType, StyleValue } from "vue";

import {
  CopyOutlined,
  CheckOutlined,
  MoonOutlined,
  SunOutlined,
} from "@antdv-next/icons";
import { Button, Tooltip } from "antdv-next";
import {
  computed,
  defineComponent,
  ref,
  shallowRef,
  useAttrs,
  watch,
} from "vue";

import type {
  CodeHighlighterProps,
  CodeHighlighterRef,
  CodeHighlighterSemanticType,
  CodeHighlighterSlots,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { codeToHtml } from "./shiki";
import useCodeHighlighterStyle from "./style";

export const XCodeHighlighter = defineComponent({
  name: "AxCodeHighlighter",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-code-highlighter",
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "text",
    },
    showLineNumbers: {
      type: Boolean,
      default: true,
    },
    showLanguage: {
      type: Boolean,
      default: true,
    },
    showThemeToggle: {
      type: Boolean,
      default: false,
    },
    showCopyButton: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String as PropType<"light" | "dark">,
      default: "light",
    },
    startLineNumber: {
      type: Number,
      default: 1,
    },
    styles: {
      type: Object as PropType<
        Partial<Record<CodeHighlighterSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<
        Partial<Record<CodeHighlighterSemanticType, string>>
      >,
      default: () => ({}),
    },
    onCopy: {
      type: Function as PropType<CodeHighlighterProps["onCopy"]>,
      default: undefined,
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<CodeHighlighterProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
  },
  emits: ["update:theme"],
  slots: Object as SlotsType<CodeHighlighterSlots>,
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("codeHighlighter");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useCodeHighlighterStyle(
      computed(() => props.prefixCls),
    );

    const copied = ref(false);
    const highlightedHtml = shallowRef<string>("");

    // Initialize Shiki and highlight code
    const highlightCode = async () => {
      try {
        const html = await codeToHtml(props.content, {
          lang: props.language,
          theme: props.theme === "dark" ? "vitesse-dark" : "vitesse-light",
        });

        highlightedHtml.value = html;
      } catch (e) {
        console.error("Failed to highlight code:", e);
        highlightedHtml.value = `<pre><code>${escapeHtml(props.content)}</code></pre>`;
      }
    };

    watch(
      () => [props.content, props.language, props.theme] as const,
      () => {
        void highlightCode();
      },
      { immediate: true },
    );

    function escapeHtml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    expose<CodeHighlighterRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const lines = computed(() => {
      return props.content.split("\n");
    });

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(props.content);
        copied.value = true;
        props.onCopy?.(props.content);
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      } catch (e) {
        console.error("Failed to copy:", e);
      }
    };

    const toggleTheme = () => {
      const newTheme = props.theme === "light" ? "dark" : "light";
      emit("update:theme", newTheme);
    };

    const getSlotClassName = (slot: CodeHighlighterSemanticType) => {
      return [
        `${props.prefixCls}-${slot}`,
        contextConfig.value.classes?.[slot],
        props.classes?.[slot],
      ];
    };

    const renderHeader = () => {
      if (slots.header) {
        return slots.header({
          language: props.language || "text",
          theme: props.theme,
          copied: copied.value,
          copy: handleCopy,
          toggleTheme,
        });
      }

      const hasHeaderContent =
        props.showLanguage || props.showThemeToggle || props.showCopyButton;
      if (!hasHeaderContent) return null;

      return (
        <div
          class={getSlotClassName("header")}
          style={[contextConfig.value.styles?.header, props.styles?.header]}
        >
          {props.showLanguage && (
            <span
              class={[
                `${props.prefixCls}-lang`,
                contextConfig.value.classes?.headerTitle,
                props.classes?.headerTitle,
              ]}
              style={[
                contextConfig.value.styles?.headerTitle,
                props.styles?.headerTitle,
              ]}
            >
              {props.language || "text"}
            </span>
          )}
          <div class={`${props.prefixCls}-actions`}>
            {props.showThemeToggle && (
              <Tooltip
                title={
                  props.theme === "light" ? "切换暗色主题" : "切换亮色主题"
                }
              >
                <Button
                  type="text"
                  size="small"
                  class={`${props.prefixCls}-theme-btn`}
                  onClick={toggleTheme}
                >
                  {props.theme === "light" ? <MoonOutlined /> : <SunOutlined />}
                </Button>
              </Tooltip>
            )}
            {props.showCopyButton && (
              <Tooltip title={copied.value ? "已复制" : "复制代码"}>
                <Button
                  type="text"
                  size="small"
                  class={`${props.prefixCls}-copy-btn`}
                  onClick={handleCopy}
                >
                  {copied.value ? <CheckOutlined /> : <CopyOutlined />}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      );
    };

    const renderLineNumbers = () => {
      if (!props.showLineNumbers) return null;

      return (
        <div class={`${props.prefixCls}-line-numbers`}>
          {lines.value.map((_, idx) => (
            <div key={idx} class={`${props.prefixCls}-line-number`}>
              {props.startLineNumber + idx}
            </div>
          ))}
        </div>
      );
    };

    const renderContent = () => {
      return (
        <div
          class={getSlotClassName("content")}
          style={[contextConfig.value.styles?.content, props.styles?.content]}
        >
          {renderLineNumbers()}
          <div
            class={[
              `${props.prefixCls}-code`,
              contextConfig.value.classes?.code,
              props.classes?.code,
            ]}
            style={[contextConfig.value.styles?.code, props.styles?.code]}
            innerHTML={highlightedHtml.value}
          />
        </div>
      );
    };

    return () => (
      <div
        ref={rootRef}
        {...domAttrs.value}
        class={[
          props.prefixCls,
          `${props.prefixCls}-${props.theme}`,
          props.rootClass,
          contextConfig.value.classes?.root,
          props.classes?.root,
          hashId.value,
          cssVarCls.value,
          attrs.class,
          props.class,
        ]}
        style={[
          contextConfig.value.style,
          contextConfig.value.styles?.root,
          props.styles?.root,
          attrs.style as StyleValue,
          props.style,
        ]}
      >
        {renderHeader()}
        {renderContent()}
      </div>
    );
  },
});

export default XCodeHighlighter;
