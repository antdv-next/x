import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig, mergeConfig } from "vite-plus";

import viteConfig from "./packages/docs/vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        "dayjs/plugin/advancedFormat": "dayjs/plugin/advancedFormat.js",
        "dayjs/plugin/customParseFormat": "dayjs/plugin/customParseFormat.js",
        "dayjs/plugin/localeData": "dayjs/plugin/localeData.js",
        "dayjs/plugin/weekday": "dayjs/plugin/weekday.js",
        "dayjs/plugin/weekOfYear": "dayjs/plugin/weekOfYear.js",
        "dayjs/plugin/weekYear": "dayjs/plugin/weekYear.js",
      },
    },
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "**/dist/**", "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      coverage: {
        provider: "v8",
        reporter: ["text-summary", "json-summary", "html"],
        reportsDirectory: "./coverage",
        // Scoped to the four packages that actually ship runtime code and have
        // tests. docs/playground are apps, and x-skill has no test suite —
        // folding them in would only dilute the numbers.
        include: [
          "packages/x/components/**/*.{ts,tsx,vue}",
          "packages/x-markdown/src/**/*.{ts,tsx,vue}",
          "packages/x-sdk/src/**/*.{ts,tsx,vue}",
          "packages/x-card/src/**/*.{ts,tsx,vue}",
        ],
        exclude: [
          "**/__tests__/**",
          "**/*.test.*",
          "**/style/**",
          "**/interface.ts",
          "**/*.d.ts",
        ],
        // Ratchet, not a target. Measured at 69.23 / 56.36 / 72.89 / 70.46 on
        // 2026-08-11; each floor sits ~2 points below that so ordinary PRs do
        // not trip on rounding, while a real drop still fails. Raise these as
        // coverage climbs — never lower them to make a red build pass.
        thresholds: {
          statements: 67,
          branches: 54,
          functions: 71,
          lines: 68,
        },
      },
      server: {
        deps: {
          inline: ["antdv-next", "@v-c/picker", "dayjs"],
        },
      },
    },
  }),
);
