import type { CSSProperties, PropType, StyleValue, VNodeChild } from "vue";

import { LoadingOutlined, RightOutlined } from "@antdv-next/icons";
import { useConfig } from "antdv-next/config-provider/context";
import {
  Transition,
  computed,
  defineComponent,
  ref,
  useAttrs,
  watch,
} from "vue";

import type { SemanticType, ThinkProps, ThinkRef } from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import ThinkIcon from "./icons/think";
import useThinkStyle from "./style";

export const XThink = defineComponent({
  name: "AxThink",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-think",
    },
    rootClass: {
      type: String,
      default: "",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    class: {
      type: [String, Array, Object] as PropType<ThinkProps["class"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    title: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    icon: {
      type: [String, Object, Array] as PropType<VNodeChild>,
      default: undefined,
    },
    loading: {
      type: [Boolean, String, Object, Array] as PropType<VNodeChild>,
      default: false,
    },
    expanded: {
      type: Boolean,
      default: undefined,
    },
    defaultExpanded: {
      type: Boolean,
      default: true,
    },
    blink: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:expanded", "expand"],
  setup(props, { slots, emit, expose }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("think");
    const rootRef = ref<HTMLDivElement>();
    const [hashId, cssVarCls] = useThinkStyle(computed(() => props.prefixCls));

    // Controlled/uncontrolled expanded state
    const internalExpanded = ref(props.defaultExpanded);

    const mergedExpanded = computed(() =>
      props.expanded !== undefined ? props.expanded : internalExpanded.value,
    );

    watch(
      () => props.expanded,
      val => {
        if (val !== undefined) {
          internalExpanded.value = val;
        }
      },
    );

    function toggleExpanded() {
      const next = !mergedExpanded.value;
      internalExpanded.value = next;
      emit("update:expanded", next);
      emit("expand", next);
    }

    // Collapse transition helpers
    const contentRef = ref<HTMLDivElement>();

    function onBeforeEnter(el: Element) {
      (el as HTMLElement).style.height = "0";
      (el as HTMLElement).style.opacity = "0";
    }

    function onEnter(el: Element) {
      const htmlEl = el as HTMLElement;
      htmlEl.style.height = `${htmlEl.scrollHeight}px`;
      htmlEl.style.opacity = "1";
    }

    function onAfterEnter(el: Element) {
      (el as HTMLElement).style.height = "";
      (el as HTMLElement).style.opacity = "";
    }

    function onBeforeLeave(el: Element) {
      (el as HTMLElement).style.height =
        `${(el as HTMLElement).scrollHeight}px`;
      (el as HTMLElement).style.opacity = "1";
    }

    function onLeave(el: Element) {
      // Force reflow
      void (el as HTMLElement).offsetHeight;
      (el as HTMLElement).style.height = "0";
      (el as HTMLElement).style.opacity = "0";
    }

    function onAfterLeave(el: Element) {
      (el as HTMLElement).style.height = "";
      (el as HTMLElement).style.opacity = "";
    }

    // Icon rendering
    const renderIcon = computed(() => {
      if (slots.icon) return slots.icon();

      // Loading state
      if (props.loading) {
        if (props.loading === true) {
          return <LoadingOutlined />;
        }
        // Custom loading VNodeChild
        return props.loading;
      }

      // Custom icon or default ThinkIcon
      return props.icon ?? <ThinkIcon />;
    });

    // DOM attrs (exclude class/style)
    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const prefixCls = computed(() => props.prefixCls);

    expose<ThinkRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    return () => (
      <div
        ref={rootRef}
        {...domAttrs.value}
        class={[
          prefixCls.value,
          contextConfig.value.classes?.root,
          props.rootClass,
          props.classes?.root,
          hashId.value,
          cssVarCls.value,
          attrs.class,
          props.class,
          {
            [`${prefixCls.value}-rtl`]: configCtx.value.direction === "rtl",
          },
        ]}
        style={[
          contextConfig.value.style,
          contextConfig.value.styles?.root,
          props.styles?.root,
          attrs.style as StyleValue,
          props.style,
        ]}
      >
        {/* Status header */}
        <div
          class={[
            `${prefixCls.value}-status-wrapper`,
            contextConfig.value.classes?.status,
            props.classes?.status,
          ]}
          style={[contextConfig.value.styles?.status, props.styles?.status]}
          onClick={toggleExpanded}
        >
          <div class={`${prefixCls.value}-status-icon`}>{renderIcon.value}</div>
          <div
            class={[
              `${prefixCls.value}-status-text`,
              {
                [`${prefixCls.value}-motion-blink`]: props.blink,
              },
            ]}
          >
            {slots.title?.() ?? props.title}
          </div>
          <span
            class={`${prefixCls.value}-status-down-icon`}
            style={{
              transform: mergedExpanded.value
                ? "rotate(90deg)"
                : "rotate(0deg)",
            }}
          >
            <RightOutlined />
          </span>
        </div>

        {/* Collapsible content */}
        <Transition
          name={`${prefixCls.value}-collapse`}
          onBeforeEnter={onBeforeEnter}
          onEnter={onEnter}
          onAfterEnter={onAfterEnter}
          onBeforeLeave={onBeforeLeave}
          onLeave={onLeave}
          onAfterLeave={onAfterLeave}
        >
          {mergedExpanded.value ? (
            <div ref={contentRef}>
              <div
                class={[
                  `${prefixCls.value}-content`,
                  contextConfig.value.classes?.content,
                  props.classes?.content,
                ]}
                style={[
                  contextConfig.value.styles?.content,
                  props.styles?.content,
                ]}
              >
                {slots.default?.()}
              </div>
            </div>
          ) : null}
        </Transition>
      </div>
    );
  },
});

export default XThink;
