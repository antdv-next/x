import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { i18n } from '../locales'

export interface AppState {
  locale: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    locale: useStorage('locale', 'zh-CN'),
  }),
  actions: {
    setLocale(locale: string) {
      this.locale = locale
      i18n.global.locale.value = locale as any
    },
    toggleLocale() {
      const nextLocale = this.locale === 'zh-CN' ? 'en-US' : 'zh-CN'
      this.setLocale(nextLocale)
    },
    init() {
      if (this.locale) {
        this.setLocale(this.locale)
      }
    },
  },
})
