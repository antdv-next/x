export const LIB_EXTERNALS = [
  "vue",
  "antdv-next",
  /^antdv-next\/.*/,
  "@antdv-next/icons",
  "@antdv-next/cssinjs",
  /^@antdv-next\/cssinjs\/.*/,
  "@ant-design/fast-color",
  /^@ant-design\/fast-color\/.*/,
  "@v-c/util",
  /^@v-c\/util\/.*/,
  "@vueuse/core",
  /^dayjs/,
  "mermaid",
  /^mermaid\/.*/,
  "shiki",
  /^shiki\/.*/,
  /^prosemirror-.*/,
  "prosemirror-transform",
  "orderedmap",
  "w3c-keyname",
  "rope-sequence",
  "crelt",
];

export const TEST_FILE_PATTERNS = [
  "!./components/**/__tests__/**",
  "!./components/**/*.test.*",
];
