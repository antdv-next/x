import type { PropType } from "vue";

import { RightOutlined } from "@antdv-next/icons";
import { computed, defineComponent, Transition } from "vue";

import type { GroupInfoType } from "./interface";

export interface GroupTitleProps {
  prefixCls?: string;
  rootPrefixCls?: string;
  groupInfo: GroupInfoType;
  classes?: any;
  enableCollapse?: boolean;
  expandedKeys?: string[];
  onItemExpand?: (curKey: string) => void;
}

const GroupTitle = defineComponent({
  name: "XConversationsGroupTitle",
  props: {
    prefixCls: {
      type: String,
      default: "antd-conversations",
    },
    rootPrefixCls: {
      type: String,
      default: "ant",
    },
    groupInfo: {
      type: Object as PropType<GroupInfoType>,
      required: true,
    },
    classes: {
      type: [String, Array, Object] as PropType<GroupTitleProps["classes"]>,
      default: undefined,
    },
    enableCollapse: {
      type: Boolean,
      default: true,
    },
    expandedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    onItemExpand: {
      type: Function as PropType<GroupTitleProps["onItemExpand"]>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const collapseMotionName = computed(
      () => `${props.rootPrefixCls}-motion-collapse`,
    );

    const stopTransition = (
      el: HTMLElement,
      done?: () => void,
      timeout = 500,
    ) => {
      if (!done) return;
      let called = false;

      const clear = () => {
        if (called) return;
        called = true;
        el.removeEventListener("transitionend", onTransitionEnd);
        done();
      };

      const onTransitionEnd = (e: Event) => {
        if (e.target !== el) return;
        clear();
      };

      el.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(clear, timeout);
    };

    const onBeforeEnter = (el: Element) => {
      const node = el as HTMLElement;
      node.classList.add(`${collapseMotionName.value}-legacy`);
      node.style.height = "0px";
      node.style.opacity = "0";
    };

    const onEnter = (el: Element, done: () => void) => {
      const node = el as HTMLElement;
      node.classList.add(`${collapseMotionName.value}-legacy-active`);
      void node.offsetHeight;
      node.style.height = `${node.scrollHeight}px`;
      node.style.opacity = "1";
      stopTransition(node, done);
    };

    const onAfterEnter = (el: Element) => {
      const node = el as HTMLElement;
      node.classList.remove(`${collapseMotionName.value}-legacy`);
      node.classList.remove(`${collapseMotionName.value}-legacy-active`);
      node.style.height = "";
      node.style.opacity = "";
    };

    const onBeforeLeave = (el: Element) => {
      const node = el as HTMLElement;
      node.classList.add(collapseMotionName.value);
      node.style.height = `${node.scrollHeight}px`;
      node.style.opacity = "1";
    };

    const onLeave = (el: Element, done: () => void) => {
      const node = el as HTMLElement;
      void node.offsetHeight;
      node.style.height = "0px";
      node.style.opacity = "0";
      stopTransition(node, done);
    };

    const onAfterLeave = (el: Element) => {
      const node = el as HTMLElement;
      node.classList.remove(collapseMotionName.value);
      node.style.height = "";
      node.style.opacity = "";
    };

    const mergeCollapsible = computed(() => {
      return props.groupInfo.collapsible && props.enableCollapse;
    });

    const groupOpen = computed(() => {
      if (!mergeCollapsible.value) return true;

      return props.expandedKeys?.includes(props.groupInfo.name);
    });

    const labelNode = computed(() => {
      const { label, name } = props.groupInfo;

      if (typeof label === "function")
        return label(name, { groupInfo: props.groupInfo });

      return label || name;
    });

    return () => (
      <li class={props.classes}>
        <div
          class={[
            `${props.prefixCls}-group-title`,
            {
              [`${props.prefixCls}-group-title-collapsible`]:
                mergeCollapsible.value,
            },
          ]}
          onClick={() => {
            if (mergeCollapsible.value)
              props.onItemExpand?.(props.groupInfo.name);
          }}
        >
          {labelNode.value && (
            <div class={`${props.prefixCls}-group-label`}>
              {labelNode.value}
            </div>
          )}
          {mergeCollapsible.value && (
            <div
              class={[
                `${props.prefixCls}-group-collapse-trigger`,
                `${props.prefixCls}-group-collapse-trigger-${groupOpen.value ? "open" : "close"}`,
              ]}
            >
              <RightOutlined />
            </div>
          )}
        </div>
        <Transition
          onBeforeEnter={onBeforeEnter}
          onEnter={onEnter}
          onAfterEnter={onAfterEnter}
          onBeforeLeave={onBeforeLeave}
          onLeave={onLeave}
          onAfterLeave={onAfterLeave}
        >
          {mergeCollapsible.value ? (
            groupOpen.value ? (
              <div>{slots.default?.()}</div>
            ) : null
          ) : (
            <div>{slots.default?.()}</div>
          )}
        </Transition>
      </li>
    );
  },
});

export default GroupTitle;
