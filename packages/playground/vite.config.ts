import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";

const baseUrl = fileURLToPath(new URL(".", import.meta.url));

const packagesDir = path.resolve(baseUrl, "..");

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@antdv-next\/x$/,
        replacement: path.resolve(packagesDir, "x/components/index.ts"),
      },
      {
        find: /^@antdv-next\/x-markdown$/,
        replacement: path.resolve(packagesDir, "x-markdown/src/index.ts"),
      },
      {
        find: /^@antdv-next\/x-sdk$/,
        replacement: path.resolve(packagesDir, "x-sdk/src/index.ts"),
      },
      {
        find: /^@antdv-next\/x-card$/,
        replacement: path.resolve(packagesDir, "x-card/src/index.ts"),
      },
      {
        find: /^@antdv-next\/x\/(.+)$/,
        replacement: path.resolve(packagesDir, "x/components/$1"),
      },
      {
        find: /^@antdv-next\/x-markdown\/(.+)$/,
        replacement: path.resolve(packagesDir, "x-markdown/src/$1"),
      },
      {
        find: /^@antdv-next\/x-sdk\/(.+)$/,
        replacement: path.resolve(packagesDir, "x-sdk/src/$1"),
      },
      {
        find: /^@antdv-next\/x-card\/(.+)$/,
        replacement: path.resolve(packagesDir, "x-card/src/$1"),
      },
      {
        find: "@",
        replacement: path.resolve(baseUrl, "src"),
      },
    ],
  },
  plugins: [
    tsxResolveTypes({
      defaultPropsToUndefined: ["Boolean"],
    }),
    vueJsx(),
    vue(),
  ],
});
