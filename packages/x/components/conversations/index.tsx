import type { PropType, StyleValue } from 'vue'
import type {
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  GroupInfoType,
  ItemType,
  PrefixKeysType,
  ShortcutKeys,
} from './interface'
import { Divider } from 'antdv-next'
import { useConfig } from 'antdv-next/dist/config-provider/context'
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
} from 'vue'
import Creation from './Creation'
import GroupTitle from './GroupTitle'
import { getShortcutKeysIcon } from './hooks/useCreation'
import useGroupable from './hooks/useGroupable'
import ConversationsItem from './Item'
import useConversationsStyle from './style'
import useXComponentConfig from '../x-provider/hooks/use-x-component-config'

const PrefixKeys: PrefixKeysType = {
  Alt: ['altKey', 'Alt', 'Alt'],
  Ctrl: ['ctrlKey', 'Ctrl', 'Ctrl'],
  Meta: ['metaKey', 'Cmd', 'Win'],
  Shift: ['shiftKey', 'Shift', 'Shift'],
}

const NumberKeyCode = Array.from({ length: 9 }, (_, i) => 49 + i)

function getShortcutAction(event: KeyboardEvent, shortcutKey: ShortcutKeys<number | 'number'>) {
  const copyShortcutKey = [...shortcutKey]
  const keyCode = copyShortcutKey.pop()
  const signKeys = copyShortcutKey as (keyof PrefixKeysType)[]

  const hitSignKeys = signKeys.every((signKey) => {
    const eventKey = PrefixKeys[signKey]?.[0]
    return !!event[eventKey]
  })

  if (!hitSignKeys)
    return false

  if (keyCode === 'number') {
    const numberIndex = NumberKeyCode.indexOf(event.keyCode)

    if (numberIndex > -1)
      return { actionKeyCodeNumber: numberIndex }

    return false
  }

  if (event.keyCode === keyCode)
    return { actionKeyCodeNumber: false as const }

  return false
}

function getItemsShortcutKeys(
  shortcutKeys?: ConversationsProps['shortcutKeys'],
): Array<{ shortcutKey: ShortcutKeys<number | 'number'>, index?: number }> {
  const itemsShortcutKeys = shortcutKeys?.items

  if (!Array.isArray(itemsShortcutKeys))
    return []

  if (itemsShortcutKeys.every(item => Array.isArray(item))) {
    return (itemsShortcutKeys as ShortcutKeys<number>[]).map((shortcutKey, index) => ({
      shortcutKey,
      index,
    }))
  }

  return [{ shortcutKey: itemsShortcutKeys as ShortcutKeys<'number'> }]
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement))
    return false

  if (target.isContentEditable)
    return true

  const tagName = target.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

export const XConversations = defineComponent({
  name: 'XConversations',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ItemType[]>,
      default: () => [],
    },
    activeKey: {
      type: [String, Number] as PropType<ConversationsProps['activeKey']>,
      default: undefined,
    },
    defaultActiveKey: {
      type: [String, Number] as PropType<ConversationsProps['defaultActiveKey']>,
      default: undefined,
    },
    onActiveChange: {
      type: Function as PropType<ConversationsProps['onActiveChange']>,
      default: undefined,
    },
    menu: {
      type: [Object, Function] as PropType<ConversationsProps['menu']>,
      default: undefined,
    },
    groupable: {
      type: [Boolean, Object] as PropType<ConversationsProps['groupable']>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<ConversationsProps['styles']>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<ConversationsProps['classes']>,
      default: () => ({}),
    },
    prefixCls: {
      type: String,
      default: 'antdx-conversations',
    },
    rootClassName: {
      type: String,
      default: '',
    },
    class: {
      type: [String, Array, Object] as PropType<ConversationsProps['class']>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<ConversationsProps['style']>,
      default: undefined,
    },
    shortcutKeys: {
      type: Object as PropType<ConversationsProps['shortcutKeys']>,
      default: undefined,
    },
    creation: {
      type: Object as PropType<ConversationsProps['creation']>,
      default: undefined,
    },
  },
  emits: ['update:activeKey', 'expand'],
  setup(props, { expose, emit }) {
    const configCtx = useConfig()
    const attrs = useAttrs()
    const contextConfig = useXComponentConfig('conversations')
    const rootRef = ref<HTMLUListElement>()
    const [hashId, cssVarCls] = useConversationsStyle(computed(() => props.prefixCls))

    const mergedItems = computed(() => props.items ?? [])

    const { groupList, collapsibleOptions, keyList } = useGroupable(
      computed(() => props.groupable),
      mergedItems,
    )

    const innerActiveKey = ref<ConversationsProps['activeKey']>(props.defaultActiveKey)

    const mergedActiveKey = computed(() => {
      if (props.activeKey !== undefined)
        return props.activeKey

      return innerActiveKey.value
    })

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    const mergedShortcutKeys = computed(() => {
      return {
        ...(contextConfig.value.shortcutKeys ?? {}),
        ...(props.shortcutKeys ?? {}),
      } as ConversationsProps['shortcutKeys']
    })

    const innerExpandedKeys = ref<string[]>([])

    watch(
      () => collapsibleOptions.value.defaultExpandedKeys,
      (keys) => {
        if (collapsibleOptions.value.expandedKeys === undefined)
          innerExpandedKeys.value = [...(keys ?? [])]
      },
      { immediate: true },
    )

    const mergedExpandedKeys = computed(() => {
      return collapsibleOptions.value.expandedKeys ?? innerExpandedKeys.value
    })

    const setActiveKey = (key: ConversationItemType['key']) => {
      if (props.activeKey === undefined)
        innerActiveKey.value = key

      emit('update:activeKey', key)
    }

    const onConversationItemClick: ConversationsProps['onActiveChange'] = (key, item) => {
      setActiveKey(key)
      props.onActiveChange?.(
        key,
        item ?? props.items?.find(itemData => itemData.type !== 'divider' && itemData.key === key),
      )
    }

    const onItemExpand = (curKey: string) => {
      const targetKeys = mergedExpandedKeys.value.includes(curKey)
        ? mergedExpandedKeys.value.filter(key => key !== curKey)
        : [...mergedExpandedKeys.value, curKey]

      if (collapsibleOptions.value.expandedKeys === undefined)
        innerExpandedKeys.value = targetKeys

      collapsibleOptions.value.onExpand?.(targetKeys)
      emit('expand', targetKeys)
    }

    const creationShortcutInfo = computed(() => {
      const creationShortcutKeys = mergedShortcutKeys.value?.creation
      if (!creationShortcutKeys)
        return undefined

      return {
        shortcutKeys: creationShortcutKeys,
        shortcutKeysIcon: creationShortcutKeys.map(key => getShortcutKeysIcon(key)),
      }
    })

    const keyLockRef = ref(false)

    const onKeydown = (event: KeyboardEvent) => {
      if (!mergedShortcutKeys.value || keyLockRef.value || isTypingTarget(event.target))
        return

      const creationShortcutKeys = mergedShortcutKeys.value.creation

      if (creationShortcutKeys) {
        const creationAction = getShortcutAction(event, creationShortcutKeys)

        if (creationAction) {
          keyLockRef.value = true

          if (typeof props.creation?.onClick === 'function' && !props.creation.disabled)
            props.creation.onClick()

          return
        }
      }

      const itemShortcuts = getItemsShortcutKeys(mergedShortcutKeys.value)

      for (const itemShortcut of itemShortcuts) {
        const itemAction = getShortcutAction(event, itemShortcut.shortcutKey)

        if (!itemAction)
          continue

        keyLockRef.value = true

        const index =
          typeof itemAction.actionKeyCodeNumber === 'number'
            ? itemAction.actionKeyCodeNumber
            : itemShortcut.index

        if (typeof index === 'number') {
          const keyInfo = keyList.value[index]

          if (keyInfo && !keyInfo.disabled)
            onConversationItemClick?.(keyInfo.key)
        }

        return
      }
    }

    const onKeyup = () => {
      keyLockRef.value = false
    }

    watch(
      () => mergedShortcutKeys.value,
      (shortcutKeys) => {
        if (typeof document === 'undefined')
          return

        document.removeEventListener('keydown', onKeydown)
        document.removeEventListener('keyup', onKeyup)

        if (shortcutKeys) {
          document.addEventListener('keydown', onKeydown)
          document.addEventListener('keyup', onKeyup)
        }
      },
      { immediate: true },
    )

    onBeforeUnmount(() => {
      if (typeof document === 'undefined')
        return

      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('keyup', onKeyup)
    })

    expose<ConversationsRef>({
      get nativeElement() {
        return rootRef.value as HTMLUListElement
      },
    })

    const getItemNode = (itemData: ItemType[]) => {
      return itemData.map((conversationInfo, conversationIndex) => {
        if (conversationInfo.type === 'divider') {
          return (
            <Divider
              key={conversationInfo.key ?? `key-divider-${conversationIndex}`}
              class={`${props.prefixCls}-divider`}
              dashed={conversationInfo.dashed}
            />
          )
        }

        const baseConversationInfo = conversationInfo as ConversationItemType
        const { label: _label, disabled: _disabled, icon: _icon, ...restInfo } = baseConversationInfo

        return (
          <ConversationsItem
            {...restInfo}
            key={baseConversationInfo.key ?? `key-${conversationIndex}`}
            info={baseConversationInfo}
            prefixCls={props.prefixCls}
            direction={configCtx.value.direction}
            className={[
              contextConfig.value.classes?.item,
              props.classes?.item,
              baseConversationInfo.class,
            ]}
            style={[
              contextConfig.value.styles?.item,
              props.styles?.item,
              baseConversationInfo.style,
            ]}
            menu={typeof props.menu === 'function' ? props.menu(baseConversationInfo) : props.menu}
            active={mergedActiveKey.value === baseConversationInfo.key}
            onClick={onConversationItemClick}
          />
        )
      })
    }

    return () => (
      <ul
        ref={rootRef}
        {...domAttrs.value}
        class={[
          props.prefixCls,
          contextConfig.value.className,
          props.rootClassName,
          contextConfig.value.classes?.root,
          props.classes?.root,
          hashId.value,
          cssVarCls.value,
          attrs.class,
          props.class,
          {
            [`${props.prefixCls}-rtl`]: configCtx.value.direction === 'rtl',
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
            className={[contextConfig.value.classes?.creation, props.classes?.creation]}
            style={{
              ...(contextConfig.value.styles?.creation ?? {}),
              ...(props.styles?.creation ?? {}),
            }}
            shortcutKeyInfo={creationShortcutInfo.value}
            prefixCls={`${props.prefixCls}-creation`}
            {...props.creation}
          />
        )}
        {groupList.value.map((groupInfo: GroupInfoType, groupIndex: number) => {
          const itemNode = getItemNode(groupInfo.data)

          return groupInfo.enableGroup
            ? (
                <GroupTitle
                  key={groupInfo.name || `key-${groupIndex}`}
                  prefixCls={props.prefixCls}
                  groupInfo={groupInfo}
                  className={[contextConfig.value.classes?.group, props.classes?.group]}
                  expandedKeys={mergedExpandedKeys.value}
                  onItemExpand={onItemExpand}
                >
                  <ul
                    class={[
                      `${props.prefixCls}-list`,
                      {
                        [`${props.prefixCls}-group-collapsible-list`]: groupInfo.collapsible,
                      },
                    ]}
                    style={[contextConfig.value.styles?.group, props.styles?.group]}
                  >
                    {itemNode}
                  </ul>
                </GroupTitle>
              )
            : itemNode
        })}
      </ul>
    )
  },
})

type ConversationsType = typeof XConversations & {
  Creation: typeof Creation
}

const ConversationsWithSub = XConversations as ConversationsType
ConversationsWithSub.Creation = Creation

export type {
  ConversationItemType,
  ConversationsProps,
  ConversationsRef,
  CreationProps,
  DividerItemType,
  GroupableProps,
  ItemType,
  ShortcutKeys,
} from './interface'

export {
  Creation as ConversationsCreation,
}

export default ConversationsWithSub
