import type { ComputedRef } from "vue";

import { computed } from "vue";

import type { CollapsibleOptions } from "../../_utils/hooks/useCollapsible";
import type {
  Collapsible,
  ConversationItemType,
  ConversationsProps,
  GroupInfoType,
  GroupableProps,
  ItemType,
} from "../interface";

interface GroupConfig {
  label: GroupableProps["label"];
  collapsibleHandle: Collapsible;
  collapsibleOptions: CollapsibleOptions;
}

type KeyList = { key: string; disabled?: boolean }[];

export default function useGroupable(
  groupable: ComputedRef<ConversationsProps["groupable"]>,
  items: ComputedRef<ItemType[]>,
) {
  const groupConfig = computed<GroupConfig>(() => {
    let baseConfig: GroupConfig = {
      label: "",
      collapsibleHandle: false,
      collapsibleOptions: {},
    };

    if (!groupable.value) return baseConfig;

    if (typeof groupable.value === "object") {
      const {
        collapsible,
        defaultExpandedKeys,
        expandedKeys,
        onExpand,
        ...other
      } = groupable.value;

      baseConfig = {
        ...baseConfig,
        ...other,
        collapsibleHandle: collapsible ?? false,
        collapsibleOptions: {
          defaultExpandedKeys,
          expandedKeys,
          onExpand,
        },
      };
    }

    return baseConfig;
  });

  const groupList = computed<GroupInfoType[]>(() => {
    return items.value.reduce<GroupInfoType[]>((currentGroupList, item) => {
      if (
        item?.type === "divider" ||
        !(item as ConversationItemType).group ||
        !groupable.value
      ) {
        currentGroupList.push({
          data: [item],
          name: "",
          label: "",
          enableGroup: false,
          collapsible: false,
        });
        return currentGroupList;
      }

      const baseItem = item as Required<ConversationItemType>;
      const foundIndex = currentGroupList.findIndex(
        group => group.name === baseItem.group,
      );

      if (foundIndex > -1) {
        currentGroupList[foundIndex]?.data.push(baseItem);
        return currentGroupList;
      }

      const { collapsibleHandle, label } = groupConfig.value;
      const collapsible =
        typeof collapsibleHandle === "function"
          ? collapsibleHandle(baseItem.group)
          : collapsibleHandle;

      currentGroupList.push({
        data: [baseItem],
        enableGroup: true,
        name: baseItem.group,
        label,
        collapsible,
      });

      return currentGroupList;
    }, []);
  });

  const keyList = computed<KeyList>(() => {
    return groupList.value.reduce<KeyList>((currentKeyList, group) => {
      group.data.forEach(item => {
        if (item.type !== "divider") {
          const baseItem = item as ConversationItemType;
          currentKeyList.push({
            key: baseItem.key,
            disabled: baseItem.disabled,
          });
        }
      });

      return currentKeyList;
    }, []);
  });

  const collapsibleOptions = computed(
    () => groupConfig.value.collapsibleOptions,
  );

  return {
    groupList,
    keyList,
    collapsibleOptions,
  };
}
