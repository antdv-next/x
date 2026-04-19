import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";
import vueResolveTypes from "vite-plugin-vue-resolve-types";
import { defineConfig } from "vite-plus";

const BROWSER_EXTERNALS = ["vue", /^vue\//, "@vue/shared", "@antdv-next/icons"];

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
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
  },
  build: {
    outDir: "dist-browser",
    minify: true,
    sourcemap: false,
    rolldownOptions: {
      external: BROWSER_EXTERNALS,
      output: {
        globals: {
          vue: "Vue",
          "antdv-next": "antd",
          "@antdv-next/icons": "AntdIcons",
        },
      },
    },
    emptyOutDir: true,
    lib: {
      entry: "components/index.ts",
      formats: ["es", "umd"],
      fileName: format => `index.${format}.js`,
      name: "AntdX",
    },
  },
});
