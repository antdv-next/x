import type { ClassValue, CSSProperties, PropType, StyleValue } from "vue";

import { MutedOutlined, SoundOutlined } from "@antdv-next/icons";
import { defineComponent } from "vue";

import type { ActionsItemProps } from "./ActionsItem";

import Item, { ACTIONS_ITEM_STATUS } from "./ActionsItem";

type SemanticType = "root" | "default" | "running" | "error" | "loading";

export interface ActionsAudioProps {
  status?: ActionsItemProps["status"];
  prefixCls?: string;
  rootClass?: string;
  class?: ClassValue;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
}

export const XActionsAudio = defineComponent({
  name: "XActionsAudio",
  props: {
    status: {
      type: String as PropType<ActionsItemProps["status"]>,
      default: ACTIONS_ITEM_STATUS.DEFAULT,
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
  setup(props, { attrs }) {
    const audioCls = `${props.prefixCls}-audio`;

    const statusLabelMap = {
      [ACTIONS_ITEM_STATUS.LOADING]: "Loading audio",
      [ACTIONS_ITEM_STATUS.ERROR]: "Audio error",
      [ACTIONS_ITEM_STATUS.RUNNING]: "Playing audio",
      [ACTIONS_ITEM_STATUS.DEFAULT]: "Audio",
    };

    return () => (
      <Item
        {...attrs}
        label={statusLabelMap[props.status || ACTIONS_ITEM_STATUS.DEFAULT]}
        style={props.style}
        styles={props.styles}
        class={props.class}
        rootClass={[
          props.rootClass,
          props.classes?.root,
          props.prefixCls,
          audioCls,
          props.status ? `${audioCls}-${props.status}` : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        classes={props.classes}
        status={props.status}
        defaultIcon={<MutedOutlined />}
        runningIcon={<SoundOutlined class={`${audioCls}-recording-icon`} />}
        prefixCls={props.prefixCls}
      />
    );
  },
});

export default XActionsAudio;
