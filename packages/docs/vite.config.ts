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
import { defineConfig, normalizePath } from "vite-plus";

import { mdPlugin } from "./plugins/markdown";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "docs:alias-shiki-for-code-highlighter",
      enforce: "pre",
      resolveId(id, importer) {
        if (id !== "shiki" || !importer) return null;

        const normalizedImporter = normalizePath(importer);
        if (
          !normalizedImporter.endsWith(
            "/packages/x/components/code-highlighter/CodeHighlighter.tsx",
          )
        ) {
          return null;
        }

        return fileURLToPath(new URL("./src/shiki-lite.ts", import.meta.url));
      },
    },
    {
      name: "docs:alias-mermaid-for-x-component",
      enforce: "pre",
      resolveId(id, importer) {
        if (id !== "mermaid" || !importer) return null;

        const normalizedImporter = normalizePath(importer);
        if (
          !normalizedImporter.endsWith("/packages/x/components/mermaid/Mermaid.tsx")
        ) {
          return null;
        }

        return fileURLToPath(
          new URL("./src/mermaid-lite.ts", import.meta.url),
        );
      },
    },
    {
      name: "docs:trim-infographic-builtins",
      enforce: "pre",
      load(id) {
        const normalizedId = normalizePath(id);

        if (
          normalizedId.endsWith(
            "/@antv/infographic/esm/templates/built-in.js",
          )
        ) {
          return `
import { registerTemplate } from "./registry.js";

registerTemplate("sequence-pyramid-simple", {
  design: {
    title: "default",
    structure: { type: "sequence-pyramid" },
    items: [{ type: "simple", showIcon: false, usePaletteColor: true }],
  },
  themeConfig: { colorPrimary: "#1677ff" },
});
`;
        }

        if (
          normalizedId.endsWith(
            "/@antv/infographic/esm/designs/structures/index.js",
          )
        ) {
          return `
export * from "./registry.js";
export { getStructure, getStructures, registerStructure } from "./registry.js";
export * from "./sequence-pyramid.js";
`;
        }

        if (
          normalizedId.endsWith(
            "/@antv/infographic/esm/designs/items/index.js",
          )
        ) {
          return `
export * from "./registry.js";
export { getItem, getItems, registerItem } from "./registry.js";
export * from "./SimpleItem.js";
`;
        }

        return null;
      },
    },
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
  build: {
    modulePreload: false,
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (
            id.includes("/node_modules/vue/") ||
            id.includes("/node_modules/@vue/") ||
            id.includes("/node_modules/vue-router/") ||
            id.includes("/node_modules/pinia/") ||
            id.includes("/node_modules/vue-i18n/")
          ) {
            return "vue-vendor";
          }

          const infographicMatch = id.match(
            /@antv\/infographic\/esm\/([^/]+)/,
          );
          if (infographicMatch) {
            const segment = infographicMatch[1];
            if (segment === "designs") return "infographic-designs";
            if (segment === "renderer") return "infographic-renderer";
            if (segment === "resource") return "infographic-resource";
            if (segment === "editor") return "infographic-editor";
            if (segment === "templates") return "infographic-templates";
            if (segment === "syntax") return "infographic-syntax";
            if (segment === "runtime") return "infographic-runtime";
            if (segment === "jsx") return "infographic-jsx";
            return "infographic-core";
          }

          if (
            id.includes("/node_modules/@antv/layout/") ||
            id.includes("/node_modules/@antv/hierarchy/")
          ) {
            return "infographic-layout";
          }

          if (
            id.includes("/node_modules/d3/") ||
            id.includes("/node_modules/d3-")
          ) {
            return "infographic-d3";
          }

          if (id.includes("/node_modules/postcss/")) {
            return "infographic-postcss";
          }

          if (id.includes("/node_modules/lodash-es/")) {
            return "lodash-es";
          }

          if (id.includes("/node_modules/linkedom/")) {
            return "infographic-linkedom";
          }

        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@antdv-next/x": fileURLToPath(
        new URL("../x/components/index.ts", import.meta.url),
      ),
      "@antdv-next/x-sdk": fileURLToPath(
        new URL("../x-sdk/src/index.ts", import.meta.url),
      ),
      "@antdv-next/x-markdown": fileURLToPath(
        new URL("../x-markdown/src", import.meta.url),
      ),
    },
  },
  server: {
    port: 6999,
  },
});
