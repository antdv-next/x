import type { CSSProperties, PropType } from "vue";

import { CloseOutlined } from "@antdv-next/icons";
import { Button } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import {
  computed,
  defineComponent,
  Transition,
  vShow,
  withDirectives,
} from "vue";

import { useSenderContext } from "./context";

export type HeaderSemanticType = "header" | "content";

export default defineComponent({
  name: "XSenderHeader",
  props: {
    open: { type: Boolean, default: false },
    onOpenChange: {
      type: Function as PropType<(open: boolean) => void>,
      default: undefined,
    },
    title: { type: [String, Object], default: undefined },
    prefixCls: { type: String, default: undefined },
    class: { type: String, default: undefined },
    style: {
      type: [String, Object] as PropType<string | CSSProperties>,
      default: undefined,
    },
    classNames: {
      type: Object as PropType<Partial<Record<HeaderSemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<
        Partial<Record<HeaderSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
    closable: { type: Boolean, default: true },
    forceRender: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const configCtx = useConfig();
    const senderCtx = useSenderContext();
    const prefixCls = computed(() => {
      const senderPrefix = senderCtx.value.prefixCls;
      const base = props.prefixCls ?? senderPrefix ?? "antd-sender";
      return `${base}-header`;
    });

    const direction = computed(() => configCtx.value.direction);

    return () => {
      const headerCls = prefixCls.value;
      const contentNode = (
        <div
          class={[
            headerCls,
            props.class,
            {
              [`${headerCls}-rtl`]: direction.value === "rtl",
            },
          ]}
          style={props.style}
        >
          {/* Header bar */}
          {(props.closable || props.title) && (
            <div
              class={[`${headerCls}-header`, props.classNames.header]}
              style={props.styles.header}
            >
              <div class={`${headerCls}-title`}>{props.title}</div>
              {props.closable && (
                <div class={`${headerCls}-close`}>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => props.onOpenChange?.(!props.open)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {slots.default && (
            <div
              class={[`${headerCls}-content`, props.classNames.content]}
              style={props.styles.content}
            >
              {slots.default()}
            </div>
          )}
        </div>
      );
      return (
        <Transition
          name={`${headerCls}-motion`}
          onBeforeEnter={el => {
            (el as HTMLElement).style.height = "0px";
            (el as HTMLElement).style.overflow = "hidden";
          }}
          onEnter={el => {
            (el as HTMLElement).style.height =
              `${(el as HTMLElement).scrollHeight}px`;
          }}
          onAfterEnter={el => {
            (el as HTMLElement).style.height = "";
            (el as HTMLElement).style.overflow = "";
          }}
          onBeforeLeave={el => {
            (el as HTMLElement).style.height =
              `${(el as HTMLElement).scrollHeight}px`;
            (el as HTMLElement).style.overflow = "hidden";
          }}
          onLeave={el => {
            // Force reflow
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (el as HTMLElement).offsetHeight;
            (el as HTMLElement).style.height = "0px";
          }}
          onAfterLeave={el => {
            (el as HTMLElement).style.height = "";
            (el as HTMLElement).style.overflow = "";
          }}
        >
          {props.forceRender
            ? withDirectives(contentNode, [[vShow, props.open]])
            : props.open && contentNode}
        </Transition>
      );
    };
  },
});
