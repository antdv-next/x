import type { PropType, StyleValue, VNodeChild } from "vue";

import { Typography } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref, useAttrs } from "vue";

import type { WelcomeProps, WelcomeRef } from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import useWelcomeStyle from "./style";

function isImageUrl(icon: VNodeChild): icon is string {
  return typeof icon === "string" && /^https?:\/\//.test(icon);
}

function hasContent(value: VNodeChild | VNodeChild[] | null | undefined) {
  return Array.isArray(value)
    ? value.length > 0
    : value !== null && value !== undefined;
}

export const XWelcome = defineComponent({
  name: "AxWelcome",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-welcome",
    },
    style: {
      type: [String, Object, Array] as PropType<WelcomeProps["style"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<WelcomeProps["styles"]>,
      default: () => ({}),
    },
    class: {
      type: [String, Array, Object] as PropType<WelcomeProps["class"]>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<WelcomeProps["classes"]>,
      default: () => ({}),
    },
    rootClass: {
      type: String,
      default: "",
    },
    variant: {
      type: String as PropType<WelcomeProps["variant"]>,
      default: "filled",
    },
    icon: {
      type: [String, Number, Object] as PropType<WelcomeProps["icon"]>,
      default: undefined,
    },
    title: {
      type: [String, Number, Object] as PropType<WelcomeProps["title"]>,
      default: undefined,
    },
    description: {
      type: [String, Number, Object] as PropType<WelcomeProps["description"]>,
      default: undefined,
    },
    extra: {
      type: [String, Number, Object] as PropType<WelcomeProps["extra"]>,
      default: undefined,
    },
  },
  setup(props, { expose, slots }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("welcome");
    const rootRef = ref<HTMLElement>();
    const [hashId, cssVarCls] = useWelcomeStyle(
      computed(() => props.prefixCls),
    );

    expose<WelcomeRef>({
      get nativeElement() {
        return rootRef.value as HTMLElement;
      },
    });

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const mergedCls = computed(() => [
      props.prefixCls,
      props.rootClass,
      contextConfig.value.classes?.root,
      props.classes?.root,
      hashId.value,
      cssVarCls.value,
      attrs.class,
      props.class,
      `${props.prefixCls}-${props.variant}`,
      {
        [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
      },
    ]);

    const iconNode = computed(() => {
      const iconContent = slots.icon?.() ?? props.icon;

      if (!hasContent(iconContent)) return null;
      const imageSrc =
        !slots.icon && isImageUrl(iconContent) ? iconContent : undefined;

      return (
        <div
          class={[
            `${props.prefixCls}-icon`,
            contextConfig.value.classes?.icon,
            props.classes?.icon,
          ]}
          style={[contextConfig.value.styles?.icon, props.styles?.icon]}
        >
          {imageSrc ? <img src={imageSrc} alt="icon" /> : iconContent}
        </div>
      );
    });

    const titleNode = computed(() => {
      const titleContent = slots.title?.() ?? props.title;

      if (!hasContent(titleContent)) return null;

      return (
        <Typography.Title
          level={4}
          class={[
            `${props.prefixCls}-title`,
            contextConfig.value.classes?.title,
            props.classes?.title,
          ]}
          style={[contextConfig.value.styles?.title, props.styles?.title]}
        >
          {titleContent}
        </Typography.Title>
      );
    });

    const extraNode = computed(() => {
      const extraContent = slots.extra?.() ?? props.extra;

      if (!hasContent(extraContent)) return null;

      return (
        <div
          class={[
            `${props.prefixCls}-extra`,
            contextConfig.value.classes?.extra,
            props.classes?.extra,
          ]}
          style={[contextConfig.value.styles?.extra, props.styles?.extra]}
        >
          {extraContent}
        </div>
      );
    });

    const descriptionNode = computed(() => {
      const descriptionContent = slots.description?.() ?? props.description;

      if (!hasContent(descriptionContent)) return null;

      return (
        <Typography.Text
          class={[
            `${props.prefixCls}-description`,
            contextConfig.value.classes?.description,
            props.classes?.description,
          ]}
          style={[
            contextConfig.value.styles?.description,
            props.styles?.description,
          ]}
        >
          {descriptionContent}
        </Typography.Text>
      );
    });

    return () => (
      <div
        ref={rootRef}
        {...domAttrs.value}
        class={mergedCls.value}
        style={[
          contextConfig.value.style,
          contextConfig.value.styles?.root,
          props.styles?.root,
          attrs.style as StyleValue,
          props.style,
        ]}
      >
        {iconNode.value}
        <div class={`${props.prefixCls}-content-wrapper`}>
          {extraNode.value ? (
            <div class={`${props.prefixCls}-title-wrapper`}>
              {titleNode.value}
              {extraNode.value}
            </div>
          ) : (
            titleNode.value
          )}
          {descriptionNode.value}
        </div>
      </div>
    );
  },
});

export type { SemanticType, WelcomeProps, WelcomeRef } from "./interface";

export default XWelcome;
