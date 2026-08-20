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
      // The browser entry is consumed through an import map. Keep the large
      // peer UI packages external so they are shared with the host app.
      external: [
        "vue",
        "antdv-next",
        /^antdv-next\//,
        "@antdv-next/icons",
        /^@antdv-next\/icons\//,
      ],
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
