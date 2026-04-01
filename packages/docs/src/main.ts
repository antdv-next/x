import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";
import ComponentOverview from "./components/component-overview/index.vue";
import DemoGroup from "./components/doc-demo/demo-group.vue";
import Demo from "./components/doc-demo/demo.vue";
import Installdependencies from "./components/install-dependencies/index.vue";
import { i18n } from "./locales";
import "./assets/styles/index.css";
import "uno.css";
import router from "./router";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.component("Demo", Demo);
app.component("DemoGroup", DemoGroup);
app.component("ComponentOverview", ComponentOverview);
app.component("InstallDependencies", Installdependencies);

app.mount("#app");
