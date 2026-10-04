import vueJsx from "@vitejs/plugin-vue-jsx";
import { globSync } from "tinyglobby";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite-plus";

const files = globSync(["./src/**/*.ts", "./src/**/*.tsx"])
  .sort()
  .map(file => `./${file}`);

const entries = Object.fromEntries(
  files.map(file => [
    file.replace("./src/", "").replace(/\.(?:ts|tsx)$/, ""),
    file,
  ]),
);

export default defineConfig({
  plugins: [
    vueJsx(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      entryRoot: "src",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      outDirs: "dist",
    }),
  ],
  build: {
    minify: false,
    sourcemap: false,
    emptyOutDir: true,
    rolldownOptions: {
      external: [
        "vue",
        "antdv-next",
        /^antdv-next\/.*/,
        "@v-c/util",
        "@antdv-next/cssinjs",
        /^@antdv-next\/cssinjs\/.*/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        format: "esm",
        entryFileNames: "[name].js",
        dir: "dist",
      },
    },
    lib: {
      entry: entries,
      formats: ["es"],
    },
  },
});
