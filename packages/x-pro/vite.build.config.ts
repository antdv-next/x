import vueJsx from "@vitejs/plugin-vue-jsx";
import { globSync } from "tinyglobby";
import dts from "unplugin-dts/vite";
import { tsxResolveTypes } from "vite-plugin-tsx-resolve-types";
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
    /**
     * 与 `packages/x` 一致：`defineComponent<Props>` 的类型参数只在编译期存在，
     * 没有这一步产物里不会声明运行时 props——属性会漏到根元素上，组件也读不到
     * `props.items` 之类的取值。文档站与测试都直接吃源码，只有 npm 消费者会中招。
     */
    tsxResolveTypes({
      defaultPropsToUndefined: ["Boolean"],
    }),
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
