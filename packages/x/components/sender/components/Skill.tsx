import type { PropType } from "vue";

import { CloseOutlined } from "@antdv-next/icons";
import { classNames } from "@v-c/util";
import { Tooltip } from "antdv-next";
import { computed, defineComponent } from "vue";

import type { SkillType } from "../interface";

export default defineComponent({
  name: "SenderSkill",
  props: {
    prefixCls: { type: String, required: true },
    skill: {
      type: Object as PropType<SkillType>,
      required: true,
    },
    removeSkill: {
      type: Function as PropType<() => void>,
      required: true,
    },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const componentCls = computed(() => `${props.prefixCls}-skill`);

    const closeNode = computed(() => {
      const closable = props.skill.closable;
      if (!closable) return null;

      const config = typeof closable === "boolean" ? {} : closable;
      const disabled = !!(props.disabled || config.disabled);
      const closeIcon = config.closeIcon ?? (
        <CloseOutlined class={`${componentCls.value}-close-icon`} />
      );

      return (
        <div
          class={classNames([
            `${componentCls.value}-close`,
            { [`${componentCls.value}-close-disabled`]: disabled },
          ])}
          role="button"
          aria-label="Close skill"
          aria-disabled={disabled}
          tabindex={disabled ? -1 : 0}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            if (disabled) return;
            props.removeSkill();
            config.onClose?.(event);
          }}
          onKeydown={(event: KeyboardEvent) => {
            if (disabled) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              const closeElement = event.currentTarget;
              if (closeElement instanceof HTMLElement) {
                closeElement.dispatchEvent(
                  new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: event.view,
                    detail: 1,
                    button: 0,
                    buttons: 0,
                    clientX: 0,
                    clientY: 0,
                    ctrlKey: event.ctrlKey,
                    altKey: event.altKey,
                    shiftKey: event.shiftKey,
                    metaKey: event.metaKey,
                  }),
                );
              }
            }
          }}
        >
          {closeIcon}
        </div>
      );
    });

    return () => {
      const mergeTitle = props.skill.title ?? props.skill.value;
      const titleNode = props.skill.toolTip ? (
        <Tooltip {...(props.skill.toolTip as any)}>{mergeTitle}</Tooltip>
      ) : (
        mergeTitle
      );

      return (
        <div class={`${componentCls.value}-wrapper`} contenteditable={false}>
          <div
            class={`${componentCls.value}-tag`}
            contenteditable={false}
            role="button"
            tabindex={0}
          >
            <span class={`${componentCls.value}-tag-text`}>{titleNode}</span>
            {closeNode.value}
          </div>
          <div class={`${componentCls.value}-holder`} />
        </div>
      );
    };
  },
});
