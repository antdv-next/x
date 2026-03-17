<script setup lang="ts">
import type { ComponentOverviewItem, OverviewLocale } from './data'
import { SearchOutlined } from '@antdv-next/icons'
import { computed, ref } from 'vue'
import { useDarkMode } from '@/composables/use-dark-mode'
import { useLocale } from '@/composables/use-locale'
import { componentOverviewItems } from './data'

defineOptions({ name: 'ComponentOverview' })

interface OverviewGroup {
  key: string
  label: string
  order: number
  items: ComponentOverviewItem[]
}

const search = ref('')
const searchBarAffixed = ref(false)
const { locale } = useLocale()
const { isDark } = useDarkMode()

const currentLocale = computed<OverviewLocale>(() =>
  locale.value === 'en-US' ? 'en-US' : 'zh-CN',
)

const uiText = computed(() => {
  if (currentLocale.value === 'en-US') {
    return {
      searchPlaceholder: 'Search components',
      empty: 'No matching components found',
    }
  }

  return {
    searchPlaceholder: '搜索组件',
    empty: '没有找到匹配的组件',
  }
})

const groupedItems = computed<OverviewGroup[]>(() => {
  const keyword = search.value.trim().toLowerCase()
  const filtered = componentOverviewItems
    .filter((item) => {
      if (!keyword) return true

      const searchableText = [
        item.title,
        item.slug,
        item.subtitle[currentLocale.value] ?? '',
        item.description[currentLocale.value],
        item.group[currentLocale.value],
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(keyword)
    })
    .sort((left, right) => {
      if (left.groupOrder !== right.groupOrder)
        return left.groupOrder - right.groupOrder
      return left.title.localeCompare(right.title)
    })

  const groupsMap = new Map<string, OverviewGroup>()
  filtered.forEach((item) => {
    const groupLabel = item.group[currentLocale.value]
    const key = `${item.groupOrder}-${groupLabel}`

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        label: groupLabel,
        order: item.groupOrder,
        items: [],
      })
    }

    groupsMap.get(key)!.items.push(item)
  })

  return Array.from(groupsMap.values()).sort(
    (left, right) => left.order - right.order,
  )
})

function resolveComponentPath(path: string) {
  return currentLocale.value === 'en-US' ? `${path}-en` : path
}

function normalizeCover(url: string) {
  return url.replace(/originaloriginal$/, 'original')
}

function resolveCover(item: ComponentOverviewItem) {
  const preferred = isDark.value ? item.coverDark : item.cover
  const fallback = isDark.value ? item.cover : item.coverDark
  return normalizeCover(preferred || fallback)
}

function handleAffixChange(affixed?: boolean) {
  searchBarAffixed.value = affixed ?? false
}
</script>

<template>
  <section class="component-overview">
    <a-affix :offset-top="80" @change="handleAffixChange">
      <div
        class="component-overview-search-affix"
        :class="{ 'is-affixed': searchBarAffixed }"
      >
        <a-input
          v-model:value="search"
          auto-focus
          allow-clear
          variant="borderless"
          class="component-overview-search-input"
          :placeholder="uiText.searchPlaceholder"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
    </a-affix>

    <template v-if="groupedItems.length">
      <section
        v-for="group in groupedItems"
        :key="group.key"
        class="component-overview-group"
      >
        <h2 class="component-overview-group-title">
          <a-space>
            {{ group.label }}
            <a-tag>{{ group.items.length }}</a-tag>
          </a-space>
        </h2>

        <a-row :gutter="[20, 20]">
          <a-col
            v-for="item in group.items"
            :key="item.path"
            :xs="24"
            :sm="12"
            :lg="8"
            :xl="6"
          >
            <router-link
              class="component-overview-card-link"
              :to="resolveComponentPath(item.path)"
            >
              <a-card size="small" class="component-overview-card">
                <template #title>
                  <span class="mr-4px">{{ item.title }}</span>
                  <span
                    v-if="item.subtitle[currentLocale]"
                    class="component-overview-card-subtitle"
                  >
                    {{ item.subtitle[currentLocale] }}
                  </span>
                </template>

                <div class="component-overview-card-image-wrap">
                  <img
                    class="component-overview-card-image"
                    :src="resolveCover(item)"
                    :alt="item.title"
                    loading="lazy"
                  />
                </div>
              </a-card>
            </router-link>
          </a-col>
        </a-row>
      </section>
    </template>

    <a-empty
      v-else
      class="component-overview-empty"
      :description="uiText.empty"
    />
  </section>
</template>

<style scoped>
.component-overview {
  width: 100%;
}

.component-overview-search-affix {
  padding: 4px 0;
  transition: all var(--ant-motion-duration-mid);
}

.component-overview-search-affix.is-affixed {
  padding: 12px;
  border-radius: 10px;
  background: var(--ant-color-bg-elevated);
  box-shadow: var(--ant-box-shadow-secondary);
}

.component-overview-search-input {
  width: 100%;
  font-size: 18px;
  padding-inline: 0;
}

.component-overview-search-input :deep(input) {
  font-size: 18px;
}

.component-overview-group {
  margin-top: 24px;
}

.component-overview-group-title {
  margin: 0 0 16px;
  color: var(--ant-color-text);
}

.component-overview-card-link {
  color: inherit;
  text-decoration: none;
}

.component-overview-card {
  height: 100%;
  cursor: pointer;
  transition:
    transform var(--ant-motion-duration-mid),
    box-shadow var(--ant-motion-duration-mid);
}

.component-overview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ant-box-shadow-secondary);
}

.component-overview-card-image-wrap {
  height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-overview-card-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
}

.component-overview-card-subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--ant-color-text-secondary);
}

.component-overview-empty {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .component-overview-search-affix.is-affixed {
    margin-inline: -6px;
  }
}
</style>
