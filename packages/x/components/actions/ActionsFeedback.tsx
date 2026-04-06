import type { ClassValue, CSSProperties, PropType, StyleValue } from "vue";

import {
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
} from "@antdv-next/icons";
import { Tooltip } from "antdv-next";
import { computed, defineComponent, useAttrs } from "vue";

import useActionsStyle from "./style";

enum FEEDBACK_VALUE {
  like = "like",
  dislike = "dislike",
  default = "default",
}

type SemanticType = "like" | "liked" | "dislike" | "disliked" | "root";

export interface ActionsFeedbackProps {
  value?: `${FEEDBACK_VALUE}`;
  onChange?: (value: `${FEEDBACK_VALUE}`) => void;
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
}

export const XActionsFeedback = defineComponent({
  name: "AxActionsFeedback",
  inheritAttrs: false,
  props: {
    value: {
      type: String as PropType<`${FEEDBACK_VALUE}`>,
      default: FEEDBACK_VALUE.default,
    },
    onChange: {
      type: Function as PropType<ActionsFeedbackProps["onChange"]>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      default: "antd-actions",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
  },
  setup(props) {
    const attrs = useAttrs();
    const [hashId, cssVarCls] = useActionsStyle(
      computed(() => props.prefixCls),
    );
    const feedbackCls = `${props.prefixCls}-feedback`;

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const onDislikeClick = () => {
      props.onChange?.(
        props.value === FEEDBACK_VALUE.dislike
          ? FEEDBACK_VALUE.default
          : FEEDBACK_VALUE.dislike,
      );
    };

    return () => (
      <div
        {...domAttrs.value}
        class={[
          props.prefixCls,
          feedbackCls,
          hashId.value,
          cssVarCls.value,
          props.rootClass,
          props.classes?.root,
          `${props.prefixCls}-list`,
          attrs.class,
          props.class,
        ]}
        style={[props.styles?.root, attrs.style as StyleValue, props.style]}
      >
        {[FEEDBACK_VALUE.default, FEEDBACK_VALUE.like].includes(
          props.value as FEEDBACK_VALUE,
        ) && (
          <Tooltip key={`like_${props.value}`} title="Like">
            <span
              onClick={() =>
                props.onChange?.(
                  props.value === FEEDBACK_VALUE.like
                    ? FEEDBACK_VALUE.default
                    : FEEDBACK_VALUE.like,
                )
              }
              style={[
                props.styles?.like,
                props.value === FEEDBACK_VALUE.like
                  ? props.styles?.liked
                  : undefined,
              ]}
              class={[
                `${feedbackCls}-item`,
                `${props.prefixCls}-item`,
                `${feedbackCls}-item-like`,
                props.classes?.like,
                props.value === FEEDBACK_VALUE.like
                  ? props.classes?.liked
                  : undefined,
                {
                  [`${feedbackCls}-item-like-active`]:
                    props.value === FEEDBACK_VALUE.like,
                },
              ]}
            >
              {props.value === FEEDBACK_VALUE.like ? (
                <LikeFilled />
              ) : (
                <LikeOutlined />
              )}
            </span>
          </Tooltip>
        )}

        {[FEEDBACK_VALUE.default, FEEDBACK_VALUE.dislike].includes(
          props.value as FEEDBACK_VALUE,
        ) && (
          <Tooltip key={`dislike_${props.value}`} title="Dislike">
            <span
              onClick={onDislikeClick}
              style={[
                props.styles?.dislike,
                props.value === FEEDBACK_VALUE.dislike
                  ? props.styles?.disliked
                  : undefined,
              ]}
              class={[
                `${feedbackCls}-item`,
                `${props.prefixCls}-item`,
                `${feedbackCls}-item-dislike`,
                props.classes?.dislike,
                props.value === FEEDBACK_VALUE.dislike
                  ? props.classes?.disliked
                  : undefined,
                {
                  [`${feedbackCls}-item-dislike-active`]:
                    props.value === FEEDBACK_VALUE.dislike,
                },
              ]}
            >
              {props.value === FEEDBACK_VALUE.dislike ? (
                <DislikeFilled />
              ) : (
                <DislikeOutlined />
              )}
            </span>
          </Tooltip>
        )}
      </div>
    );
  },
});

export default XActionsFeedback;
