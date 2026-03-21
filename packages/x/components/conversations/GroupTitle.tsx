import type { PropType, TransitionProps } from "vue";

import { RightOutlined } from "@antdv-next/icons";
import { computed, defineComponent, Transition } from "vue";

import type { GroupInfoType } from "./interface";

export interface GroupTitleProps {
  prefixCls?: string;
  groupInfo: GroupInfoType;
  classes?: any;
  enableCollapse?: boolean;
  expandedKeys?: string[];
  onItemExpand?: (curKey: string) => void;
  collapseTransition?: TransitionProps;
}

const GroupTitle = defineComponent({
  name: "XConversationsGroupTitle",
  props: {
    prefixCls: {
      type: String,
      default: "antd-conversations",
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
    collapseTransition: {
      type: Object as PropType<TransitionProps>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
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
        <Transition {...(props.collapseTransition ?? {})}>
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
