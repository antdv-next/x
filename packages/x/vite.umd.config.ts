import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";
import vueResolveTypes from "vite-plugin-vue-resolve-types";
import { defineConfig } from "vite-plus";

import { UMD_EXTERNALS } from "./build.constants";

export default defineConfig({
  base: "./",
  plugins: [
    vueResolveTypes(),
    vue(),
    tsxResolveTypes({
      defaultPropsToUndefined: ["Boolean"],
    }),
    vueJsx(),
  ],
  build: {
    minify: false,
    sourcemap: false,
    rolldownOptions: {
      external: UMD_EXTERNALS,
      output: {
        globals: {
          vue: "Vue",
          "antdv-next": "antd",
          "@antdv-next/icons": "AntdIcons",
          mermaid: "mermaid",
          dayjs: "dayjs",
          // plugins: 'dayjs_plugin',
          // like this
          // 'dayjs/plugin/advancedFormat': 'dayjs_plugin_advancedFormat',
        },
      },
    },
    emptyOutDir: false,
    lib: {
      entry: "components/index.ts",
      formats: ["umd"],
      fileName: () => "index.umd.js",
      name: "AntdComponents",
    },
  },
});
