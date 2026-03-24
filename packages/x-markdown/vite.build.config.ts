import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { globSync } from "tinyglobby";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite-plus";

const pluginEntries = globSync(["src/plugins/*/index.ts"]).reduce<
  Record<string, string>
>((acc, file) => {
  const entryName = file.replace(/^src\//, "").replace(/\.ts$/, "");
  acc[entryName] = resolve(__dirname, file);
  return acc;
}, {});

const entries = {
  index: resolve(__dirname, "src/index.ts"),
  ...pluginEntries,
};

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      entryRoot: "src",
      include: ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
      outDirs: "dist",
      processor: "vue",
    }),
  ],
  build: {
    emptyOutDir: true,
    cssCodeSplit: true,
    lib: {
      entry: entries,
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: ["vue", "marked", "katex", "dompurify", /^katex\/.*/],
    },
  },
});
