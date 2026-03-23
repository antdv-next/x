import { AntdvNextResolver } from "@antdv-next/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { fileURLToPath, URL } from "node:url";
import unocss from "unocss/vite";
import autoImport from "unplugin-auto-import/vite";
import components from "unplugin-vue-components/vite";
import dayjs from "vite-plugin-dayjs";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";
import vueResolveTypes from "vite-plugin-vue-resolve-types";
import { defineConfig } from "vite-plus";

import { mdPlugin } from "./plugins/markdown";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdPlugin(),
    vueResolveTypes(),
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    tsxResolveTypes({
      defaultPropsToUndefined: ["Boolean"],
    }),
    vueJsx(),
    unocss(),
    dayjs(),
    autoImport({
      dirs: ["./src/stores"],
      dts: "types/auto-imports.d.ts",
      imports: ["vue", "vue-router", "@vueuse/core", "pinia", "vue-i18n"],
    }),
    components({
      dts: "types/components.d.ts",
      dirs: [],
      resolvers: [AntdvNextResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@antdv-next/x": fileURLToPath(
        new URL("../x/components/index.ts", import.meta.url),
      ),
      "@antdv-next/x-markdown": fileURLToPath(
        new URL("../x-markdown/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: 6999,
  },
});
