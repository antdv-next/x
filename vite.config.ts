import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    // Local Claude Code worktrees hold full repo copies; never lint them.
    ignorePatterns: [".claude/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    arrowParens: "avoid",
    printWidth: 80,
    ignorePatterns: [
      "pnpm-lock.yaml",
      "dist",
      "**/types/auto-imports.d.ts",
      "**/types/components.d.ts",
      "**/*.html",
      // Local Claude Code worktrees hold full repo copies.
      ".claude/**",
    ],
    sortImports: {
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
  },
});
