import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";
import vueResolveTypes from "vite-plugin-vue-resolve-types";
import { defineConfig } from "vite-plus";

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
    outDir: "es",
    minify: true,
    sourcemap: false,
    rolldownOptions: {
      external: ["vue", "antdv-next", /^antdv-next\//],
    },
    emptyOutDir: true,
    lib: {
      entry: "components/index.ts",
      formats: ["es"],
      fileName: () => "antdv-next-x.esm.js",
      name: "AntdX",
    },
  },
});
