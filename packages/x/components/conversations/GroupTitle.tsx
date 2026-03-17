import type { PropType } from 'vue'
import type { GroupInfoType } from './interface'
import { RightOutlined } from '@antdv-next/icons'
import { computed, defineComponent } from 'vue'

export interface GroupTitleProps {
  prefixCls?: string
  groupInfo: GroupInfoType
  className?: any
  enableCollapse?: boolean
  expandedKeys?: string[]
  onItemExpand?: (curKey: string) => void
}

const GroupTitle = defineComponent({
  name: 'XConversationsGroupTitle',
  props: {
    prefixCls: {
      type: String,
      default: 'antdx-conversations',
    },
    groupInfo: {
      type: Object as PropType<GroupInfoType>,
      required: true,
    },
    className: {
      type: [String, Array, Object] as PropType<GroupTitleProps['className']>,
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
      type: Function as PropType<GroupTitleProps['onItemExpand']>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const mergeCollapsible = computed(() => {
      return props.groupInfo.collapsible && props.enableCollapse
    })

    const groupOpen = computed(() => {
      if (!mergeCollapsible.value)
        return true

      return props.expandedKeys?.includes(props.groupInfo.name)
    })

    const labelNode = computed(() => {
      const { label, name } = props.groupInfo

      if (typeof label === 'function')
        return label(name, { groupInfo: props.groupInfo })

      return label || name
    })

    return () => (
      <li class={props.className}>
        <div
          class={[
            `${props.prefixCls}-group-title`,
            {
              [`${props.prefixCls}-group-title-collapsible`]: mergeCollapsible.value,
            },
          ]}
          onClick={() => {
            if (mergeCollapsible.value)
              props.onItemExpand?.(props.groupInfo.name)
          }}
        >
          {labelNode.value && <div class={`${props.prefixCls}-group-label`}>{labelNode.value}</div>}
          {mergeCollapsible.value && (
            <div
              class={[
                `${props.prefixCls}-group-collapse-trigger`,
                `${props.prefixCls}-group-collapse-trigger-${groupOpen.value ? 'open' : 'close'}`,
              ]}
            >
              <RightOutlined />
            </div>
          )}
        </div>
        <div class={{ [`${props.prefixCls}-content-hidden`]: !groupOpen.value }}>
          {slots.default?.()}
        </div>
      </li>
    )
  },
})

export default GroupTitle
