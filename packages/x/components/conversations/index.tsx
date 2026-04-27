import type { PropType, StyleValue } from "vue";

import { Divider } from "antdv-next";
import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, useAttrs } from "vue";

import type {
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  GroupInfoType,
  ItemType,
} from "./interface";

import useShortcutKeys from "../_utils/hooks/use-shortcut-keys";
import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import useCollapsible from "../_utils/hooks/useCollapsible";
import Creation from "./Creation";
import GroupTitle from "./GroupTitle";
import useGroupable from "./hooks/useGroupable";
import ConversationsItem from "./Item";
import useConversationsStyle from "./style";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select";
}

const XConversations = defineComponent({
  name: "AxConversations",
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ItemType[]>,
      default: () => [],
    },
    activeKey: {
      type: [String, Number] as PropType<ConversationsProps["activeKey"]>,
      default: undefined,
    },
    defaultActiveKey: {
      type: [String, Number] as PropType<
        ConversationsProps["defaultActiveKey"]
      >,
      default: undefined,
    },
    onActiveChange: {
      type: Function as PropType<ConversationsProps["onActiveChange"]>,
      default: undefined,
    },
    labelRender: {
      type: [String, Number, Object, Array, Function] as PropType<
        ConversationsProps["labelRender"]
      >,
      default: undefined,
    },
    iconRender: {
      type: [String, Number, Object, Array, Function] as PropType<
        ConversationsProps["iconRender"]
      >,
      default: undefined,
    },
    groupLabelRender: {
      type: [String, Number, Object, Array, Function] as PropType<
        ConversationsProps["groupLabelRender"]
      >,
      default: undefined,
    },
    menu: {
      type: [Object, Function] as PropType<ConversationsProps["menu"]>,
      default: undefined,
    },
    groupable: {
      type: [Boolean, Object] as PropType<ConversationsProps["groupable"]>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<ConversationsProps["styles"]>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<ConversationsProps["classes"]>,
      default: () => ({}),
    },
    prefixCls: {
      type: String,
      default: "antd-conversations",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<ConversationsProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<ConversationsProps["style"]>,
      default: undefined,
    },
    shortcutKeys: {
      type: Object as PropType<ConversationsProps["shortcutKeys"]>,
      default: undefined,
    },
    creation: {
      type: Object as PropType<ConversationsProps["creation"]>,
      default: undefined,
    },
  },
  emits: ["update:activeKey", "expand"],
  setup(props, { expose, emit, slots }) {
    const configCtx = useConfig();
    const attrs = useAttrs();
    const contextConfig = useXComponentConfig("conversations");
    const rootRef = ref<HTMLUListElement>();
    const [hashId, cssVarCls] = useConversationsStyle(
      computed(() => props.prefixCls),
    );

    const mergedItems = computed(() => props.items ?? []);

    const { groupList, collapsibleOptions, keyList } = useGroupable(
      computed(() => props.groupable),
      mergedItems,
    );

    const innerActiveKey = ref<ConversationsProps["activeKey"]>(
      props.defaultActiveKey,
    );

    const mergedActiveKey = computed(() => {
      if (props.activeKey !== undefined) return props.activeKey;

      return innerActiveKey.value;
    });

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const {
      enableCollapse,
      expandedKeys: mergedExpandedKeys,
      onItemExpand,
      collapseTransition,
    } = useCollapsible(
      computed(() => collapsibleOptions.value),
      computed(() => configCtx.value.getPrefixCls()),
    );

    const setActiveKey = (key: ConversationItemType["key"]) => {
      if (props.activeKey === undefined) innerActiveKey.value = key;

      emit("update:activeKey", key);
    };

    const onConversationItemClick: ConversationsProps["onActiveChange"] = (
      key,
      item,
    ) => {
      setActiveKey(key);
      props.onActiveChange?.(
        key,
        item ??
          props.items?.find(
            itemData => itemData.type !== "divider" && itemData.key === key,
          ),
      );
    };

    const onExpand = (curKey: string) => {
      const targetKeys = onItemExpand.value?.(curKey);
      if (targetKeys) emit("expand", targetKeys);
    };

    const [, shortcutKeysInfo, subscribeShortcutAction] = useShortcutKeys(
      "conversations",
      computed(() => props.shortcutKeys),
      {
        shouldIgnore: event => isTypingTarget(event.target),
      },
    );

    const creationShortcutInfo = computed(() => {
      return shortcutKeysInfo.value.creation;
    });

    subscribeShortcutAction(shortcutInfo => {
      if (!shortcutInfo) return;

      if (shortcutInfo.name === "creation") {
        if (
          typeof props.creation?.onClick === "function" &&
          !props.creation.disabled
        ) {
          props.creation.onClick();
        }
        return;
      }

      if (shortcutInfo.name !== "items") return;

      const index =
        typeof shortcutInfo.actionKeyCodeNumber === "number"
          ? shortcutInfo.actionKeyCodeNumber
          : shortcutInfo.index;

      if (typeof index !== "number") return;

      const keyInfo = keyList.value[index];
      if (keyInfo && !keyInfo.disabled) onConversationItemClick?.(keyInfo.key);
    });

    expose<ConversationsRef>({
      get nativeElement() {
        return rootRef.value as HTMLUListElement;
      },
    });

    const getItemNode = (itemData: ItemType[], indexRef: { value: number }) => {
      return itemData.map((conversationInfo, conversationIndex) => {
        if (conversationInfo.type === "divider") {
          return (
            <Divider
              key={conversationInfo.key ?? `key-divider-${conversationIndex}`}
              class={`${props.prefixCls}-divider`}
              dashed={conversationInfo.dashed}
            />
          );
        }

        const baseConversationInfo = conversationInfo as ConversationItemType;
        const {
          label: _label,
          disabled: _disabled,
          icon: _icon,
          ...restInfo
        } = baseConversationInfo;
        const currentIndex = indexRef.value++;
        const isActive = mergedActiveKey.value === baseConversationInfo.key;

        return (
          <ConversationsItem
            {...restInfo}
            key={baseConversationInfo.key ?? `key-${conversationIndex}`}
            info={baseConversationInfo}
            index={currentIndex}
            prefixCls={props.prefixCls}
            direction={configCtx.value.direction}
            labelRender={props.labelRender}
            iconRender={props.iconRender}
            labelRenderSlot={slots.labelRender}
            iconRenderSlot={slots.iconRender}
            classes={[
              contextConfig.value.classes?.item,
              props.classes?.item,
              baseConversationInfo.class,
            ]}
            style={[
              contextConfig.value.styles?.item,
              props.styles?.item,
              baseConversationInfo.style,
            ]}
            menu={
              typeof props.menu === "function"
                ? props.menu(baseConversationInfo)
                : props.menu
            }
            active={isActive}
            onClick={onConversationItemClick}
          />
        );
      });
    };

    return () => {
      const itemIndexRef = { value: 0 };

      return (
        <ul
          ref={rootRef}
          {...domAttrs.value}
          class={[
            props.prefixCls,
            props.rootClass,
            contextConfig.value.classes?.root,
            props.classes?.root,
            hashId.value,
            cssVarCls.value,
            attrs.class,
            props.class,
            {
              [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
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
          {!!props.creation && (
            <Creation
              classes={[
                contextConfig.value.classes?.creation,
                props.classes?.creation,
              ]}
              style={{
                ...contextConfig.value.styles?.creation,
                ...props.styles?.creation,
              }}
              shortcutKeyInfo={creationShortcutInfo.value}
              prefixCls={`${props.prefixCls}-creation`}
              {...props.creation}
            />
          )}
          {groupList.value.map(
            (groupInfo: GroupInfoType, groupIndex: number) => {
              const itemNode = getItemNode(groupInfo.data, itemIndexRef);

              return groupInfo.enableGroup ? (
                <GroupTitle
                  key={groupInfo.name || `key-${groupIndex}`}
                  prefixCls={props.prefixCls}
                  groupInfo={groupInfo}
                  groupLabelRender={props.groupLabelRender}
                  groupLabelRenderSlot={slots.groupLabelRender}
                  classes={[
                    contextConfig.value.classes?.group,
                    props.classes?.group,
                  ]}
                  enableCollapse={enableCollapse.value}
                  expandedKeys={mergedExpandedKeys.value}
                  onItemExpand={onExpand}
                  collapseTransition={collapseTransition.value}
                >
                  <ul
                    class={[
                      `${props.prefixCls}-list`,
                      {
                        [`${props.prefixCls}-group-collapsible-list`]:
                          groupInfo.collapsible,
                      },
                    ]}
                    style={[
                      contextConfig.value.styles?.group,
                      props.styles?.group,
                    ]}
                  >
                    {itemNode}
                  </ul>
                </GroupTitle>
              ) : (
                itemNode
              );
            },
          )}
        </ul>
      );
    };
  },
});

type ConversationsType = typeof XConversations & {
  Creation: typeof Creation;
};

const ConversationsWithSub = XConversations as ConversationsType;
ConversationsWithSub.Creation = Creation;

export type {
  ConversationItemRender,
  ConversationItemRenderInfo,
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  CreationProps,
  DividerItemType,
  GroupableProps,
  GroupLabelRender,
  GroupLabelRenderInfo,
  ItemType,
} from "./interface";

export { Creation as ConversationsCreation };

export default ConversationsWithSub;
