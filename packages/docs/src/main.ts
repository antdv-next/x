import Antdx from "@antdv-next/x";
import "@antdv-next/x-markdown/themes/index.css";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./App.vue";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
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
app.use(Antdx);
app.component("Demo", Demo);
app.component("DemoGroup", DemoGroup);
app.component("ComponentOverview", ComponentOverview);
app.component("InstallDependencies", Installdependencies);

app.mount("#app");
