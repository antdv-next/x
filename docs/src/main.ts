import AntdvX from '@antdv-next/x'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import ComponentOverview from './components/component-overview/index.vue'
import DemoGroup from './components/doc-demo/demo-group.vue'
import Demo from './components/doc-demo/demo.vue'
import { i18n } from './locales'
import router from './router'
import './assets/styles/index.css'
import 'uno.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(AntdvX)
app.component('Demo', Demo)
app.component('DemoGroup', DemoGroup)
app.component('ComponentOverview', ComponentOverview)
app.mount('#app')
