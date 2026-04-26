import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { globSync } from "tinyglobby";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite-plus";

const external = ["vue", "marked", "katex", "dompurify", /^katex\/.*/];
const DIST_DIR = "dist";
const PLUGINS_DIR = "plugins";

const dtsBaseOptions = {
  tsconfigPath: "./tsconfig.build.json",
};

const buildBaseOptions = {
  minify: false,
  sourcemap: false,
  cssCodeSplit: true,
};

const entries = Object.fromEntries(
  globSync(["./src/**/*.ts", "!./src/plugins/**"])
    .sort()
    .map(file => [
      `./${file}`.replace("./src/", "").replace(/\.ts$/, ""),
      `./${file}`,
    ]),
);

const pluginEntries = globSync(["src/plugins/*/index.ts"]).reduce<
  Record<string, string>
>((acc, file) => {
  const entryName = file
    .replace(/^src\/plugins\//, "")
    .replace(/\/index\.ts$/, "");
  acc[entryName] = resolve(__dirname, file);
  return acc;
}, {});

export default defineConfig(({ mode }) => {
  if (mode === "plugins") {
    return {
      plugins: [
        dts({
          ...dtsBaseOptions,
          entryRoot: "src/plugins",
          include: ["src/plugins/**/*.ts"],
          outDirs: PLUGINS_DIR,
        }),
      ],
      build: {
        ...buildBaseOptions,
        outDir: PLUGINS_DIR,
        emptyOutDir: true,
        lib: {
          entry: pluginEntries,
          formats: ["es"],
          fileName: (_format, entryName) => `${entryName}/index.js`,
        },
        rolldownOptions: {
          external,
        },
      },
    };
  }

  return {
    plugins: [
      vue(),
      dts({
        ...dtsBaseOptions,
        entryRoot: "src",
        include: [
          "src/**/*.ts",
          "!src/plugins/**",
          "src/**/*.d.ts",
          "src/**/*.vue",
        ],
        outDirs: DIST_DIR,
        processor: "vue",
      }),
    ],
    build: {
      ...buildBaseOptions,
      outDir: DIST_DIR,
      emptyOutDir: true,
      lib: {
        entry: entries,
        formats: ["es"],
      },
      rolldownOptions: {
        external,
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
          format: "esm",
          entryFileNames: "[name].js",
          dir: DIST_DIR,
        },
      },
    },
  };
});
