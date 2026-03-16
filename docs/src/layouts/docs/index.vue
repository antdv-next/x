<script setup lang="ts">
import type { MenuEmits } from 'antdv-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocPage } from '@/composables/use-doc-page'
import { headerLocales } from '@/config/header'
import { docsRoutes, LOCALE_EN_US, LOCALE_ZH_CN } from '@/router/docs'
import { useAppStore } from '@/stores/app'
import DocHeader from './components/doc-header.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { pageData, anchorItems } = useDocPage()

function normalizePath(path: string) {
  if (path === '/')
    return '/'
  return path.replace(/\/+$/, '') || '/'
}

function stripLocaleSuffix(path: string) {
  if (path.endsWith('-en'))
    return path.slice(0, -3) || '/'
  if (path.endsWith('-cn'))
    return path.slice(0, -3) || '/'
  return path
}

function formatSegmentLabel(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map(word => word[0] ? word[0].toUpperCase() + word.slice(1) : word)
    .join(' ')
}

const normalizedCurrentPath = computed(() => normalizePath(route.path))
const currentPathWithoutLocale = computed(() => stripLocaleSuffix(normalizedCurrentPath.value))

const currentSectionKey = computed(() => {
  const segments = currentPathWithoutLocale.value.split('/').filter(Boolean)
  if (!segments.length)
    return ''
  return `/${segments[0]}`
})

const sectionTitle = computed(() => {
  const locale = appStore.locale === LOCALE_EN_US ? LOCALE_EN_US : LOCALE_ZH_CN
  const section = currentSectionKey.value
  if (!section)
    return ''
  return headerLocales?.[section]?.[locale] || formatSegmentLabel(section.slice(1))
})

const siderItems = computed(() => {
  const section = currentSectionKey.value
  if (!section)
    return []

  const locale = appStore.locale
  const routesInSection = docsRoutes
    .filter((item) => {
      if (item.meta?.locale !== locale)
        return false
      const normalizedPath = stripLocaleSuffix(normalizePath(item.path))
      return normalizedPath === section || normalizedPath.startsWith(`${section}/`)
    })
    .sort((left, right) => {
      const leftPath = stripLocaleSuffix(normalizePath(left.path))
      const rightPath = stripLocaleSuffix(normalizePath(right.path))
      if (leftPath === section)
        return -1
      if (rightPath === section)
        return 1
      return leftPath.localeCompare(rightPath)
    })

  return routesInSection.map((item) => {
    const withoutLocale = stripLocaleSuffix(normalizePath(item.path))
    const segments = withoutLocale.split('/').filter(Boolean)
    const lastSegment = segments.at(-1) || ''
    const isSectionIndex = withoutLocale === section

    return {
      key: normalizePath(item.path),
      label: isSectionIndex
        ? (appStore.locale === LOCALE_ZH_CN ? '概览' : 'Overview')
        : formatSegmentLabel(lastSegment),
    }
  })
})

const selectedSiderKeys = computed(() => [normalizedCurrentPath.value])
const hasAnchors = computed(() => anchorItems.value.length > 0)

const handleSiderMenuClick: MenuEmits['click'] = (info) => {
  router.push(String(info.key))
}
</script>

<template>
  <div class="antdx-doc-layout">
    <DocHeader />

    <main class="antdx-doc-layout-main">
      <aside v-if="siderItems.length" class="antdx-doc-layout-sider">
        <h2 class="antdx-doc-layout-sider-title">
          {{ sectionTitle }}
        </h2>
        <a-menu
          class="ant-doc-main-sider-menu"
          mode="inline"
          :items="siderItems"
          :selected-keys="selectedSiderKeys"
          @click="handleSiderMenuClick"
        />
      </aside>

      <article class="antdx-doc-layout-content">
        <header
          v-if="pageData?.frontmatter?.title || pageData?.frontmatter?.description"
          class="antdx-doc-layout-content-header"
        >
          <h1 v-if="pageData?.frontmatter?.title" class="antdx-doc-layout-content-title">
            {{ pageData?.frontmatter?.title }}
            <small v-if="pageData?.frontmatter?.subtitle" class="antdx-doc-layout-content-subtitle">
              {{ pageData?.frontmatter?.subtitle }}
            </small>
          </h1>
          <p v-if="pageData?.frontmatter?.description" class="antdx-doc-layout-content-description">
            {{ pageData?.frontmatter?.description }}
          </p>
        </header>
        <router-view />
      </article>

      <aside v-if="hasAnchors" class="antdx-doc-layout-anchor">
        <a-anchor :items="anchorItems" :offset-top="88" :affix="false" />
      </aside>
    </main>
  </div>
</template>

<style scoped>
.antdx-doc-layout {
  min-height: 100vh;
  background: var(--ant-color-bg-layout);
  transition: background-color var(--ant-motion-duration-slow);
}

.antdx-doc-layout-main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 24px 40px;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 200px;
  gap: 40px;
}

.antdx-doc-layout-sider {
  position: sticky;
  top: 88px;
  align-self: start;
  max-height: calc(100vh - 96px);
  overflow: hidden;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  padding-right: 8px;
}

.antdx-doc-layout-sider:hover {
  overflow-y: auto;
}

.antdx-doc-layout-sider-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.antdx-doc-layout-sider :deep(.ant-menu) {
  min-height: 100%;
  padding-top: 0;
  padding-bottom: var(--ant-margin-xxl) !important;
  padding-inline: var(--ant-margin-xxs);
  border-inline-end: none;
  background: transparent !important;
}

.antdx-doc-layout-content {
  min-width: 0;
  padding: 0;
}

.antdx-doc-layout-content-header {
  margin-bottom: 24px;
}

.antdx-doc-layout-content-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
}

.antdx-doc-layout-content-subtitle {
  font-size: 16px;
  color: var(--ant-color-text-tertiary);
  font-weight: 500;
}

.antdx-doc-layout-content-description {
  margin: 12px 0 0;
  font-size: 16px;
  color: var(--ant-color-text-secondary);
}

.antdx-doc-layout-anchor {
  position: sticky;
  top: 88px;
  align-self: start;
  max-height: calc(100vh - 96px);
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-gutter: stable;
  padding-left: 8px;
}

.antdx-doc-layout-anchor :deep(.ant-anchor-wrapper) {
  background: transparent;
}

@media (max-width: 1280px) {
  .antdx-doc-layout-main {
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 32px;
  }

  .antdx-doc-layout-anchor {
    display: none;
  }
}

@media (max-width: 900px) {
  .antdx-doc-layout-main {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px;
  }

  .antdx-doc-layout-sider {
    display: none;
  }

  .antdx-doc-layout-content-title {
    font-size: 28px;
  }
}
</style>
