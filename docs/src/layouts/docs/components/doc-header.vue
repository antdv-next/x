<script setup lang="ts">
import type { MenuEmits } from 'antdv-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoUrl from '@/assets/x.png'
import { useLocale } from '@/composables/use-locale'
import { headerItems, headerLocales } from '@/config/header'
import { resolveDocRoutePath } from '@/router/docs'
import { useAppStore } from '@/stores/app'
import SwitchBtn from './switch-btn.vue'
import ThemeBtn from './theme-btn.vue'
import 'antdv-next/dist/antd.css'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { locale, t } = useLocale()

const itemKeys = headerItems.map((item) => item.key).filter(Boolean) as string[]
const headerPrefixes = [...itemKeys].sort((a, b) => b.length - a.length)

function normalizeHeaderMatchPath(path: string) {
  if (path.endsWith('-en')) return path.slice(0, -3) || '/'
  if (path.endsWith('-cn')) return path.slice(0, -3) || '/'
  return path
}

const selectedKeys = computed(() => {
  const normalizedPath = normalizeHeaderMatchPath(route.path)
  const matchedHeaderPrefix = headerPrefixes.find(
    (prefix) =>
      normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  )
  return matchedHeaderPrefix ? [matchedHeaderPrefix] : []
})

const handleHeaderChange: MenuEmits['click'] = (info) => {
  router.push(String(info.key))
}

const localeValue = computed(() => (appStore.locale === 'zh-CN' ? 1 : 2))

function changeLocale(value: 1 | 2) {
  const nextLocale = value === 1 ? 'zh-CN' : 'en-US'
  if (appStore.locale === nextLocale) return

  appStore.setLocale(nextLocale)

  const localizedPath = resolveDocRoutePath(route.path, nextLocale)
  if (!localizedPath || localizedPath === route.path) return

  router.replace({
    path: localizedPath,
    query: route.query,
    hash: route.hash,
  })
}
</script>

<template>
  <header class="antdx-doc-header">
    <div class="antdx-doc-header-inner">
      <router-link class="antdx-doc-header-logo" to="/">
        <img
          class="antdx-doc-header-logo-img"
          :src="logoUrl"
          draggable="false"
          alt="logo"
        />
        <span class="antdx-doc-header-logo-text">Antd Next X</span>
      </router-link>

      <div class="antdx-doc-header-right">
        <a-menu
          class="antdx-doc-header-menu"
          mode="horizontal"
          :items="headerItems"
          :selected-keys="selectedKeys"
          :disabled-overflow="true"
          @click="handleHeaderChange"
        >
          <template #labelRender="{ key, label }">
            {{ headerLocales?.[key]?.[locale as 'zh-CN' | 'en-US'] ?? label }}
          </template>
        </a-menu>

        <ThemeBtn />

        <SwitchBtn
          :value="localeValue"
          :tooltip1="t('ui.localeBtn.tooltip1')"
          :tooltip2="t('ui.localeBtn.tooltip2')"
          @click="changeLocale"
        >
          <template #label1> 中 </template>
          <template #label2> En </template>
        </SwitchBtn>
      </div>
    </div>
  </header>
</template>

<style scoped>
.antdx-doc-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 64px;
  width: 100%;
  background-color: color-mix(
    in srgb,
    var(--ant-color-bg-container),
    transparent 20%
  );
  backdrop-filter: blur(8px);
  box-shadow: var(--ant-box-shadow-tertiary);
}

.antdx-doc-header-inner {
  height: 64px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.antdx-doc-header-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ant-color-text);
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  white-space: nowrap;
}

.antdx-doc-header-logo-img {
  width: 32px;
  height: 32px;
  display: inline-block;
}

.antdx-doc-header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  flex-shrink: 0;
}

:deep(.antdx-doc-header-menu) {
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
  background: transparent !important;
  border-bottom: none !important;
  flex-shrink: 0;
}

:deep(.antdx-doc-header-menu .ant-menu-item) {
  height: 64px;
  line-height: 64px;
}

@media (max-width: 1024px) {
  .antdx-doc-header-right {
    gap: 10px;
  }

  .antdx-doc-header-menu :deep(.ant-menu-item) {
    padding-inline: 12px;
  }
}

@media (max-width: 768px) {
  .antdx-doc-header-inner {
    padding: 0 16px;
  }

  .antdx-doc-header-logo-text {
    display: none;
  }

  .antdx-doc-header-right {
    gap: 8px;
  }

  .antdx-doc-header-menu :deep(.ant-menu-item) {
    padding-inline: 8px;
  }
}
</style>
