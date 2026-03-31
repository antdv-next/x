export interface HeaderItem {
  key: string;
  path: string;
  basePath: string;
  label: Record<"zh-CN" | "en-US", string>;
}

export const headerItems: HeaderItem[] = [
  {
    key: "development",
    path: "/docs",
    basePath: "/docs",
    label: {
      "zh-CN": "研发",
      "en-US": "R&D",
    },
  },
  {
    key: "components",
    path: "/components",
    basePath: "/components",
    label: {
      "zh-CN": "组件",
      "en-US": "Components",
    },
  },
  {
    key: "markdown",
    path: "/markdown",
    basePath: "/markdown",
    label: {
      "zh-CN": "Markdown",
      "en-US": "Markdown",
    },
  },
  {
    key: "sdk",
    path: "/sdk",
    basePath: "/sdk",
    label: {
      "zh-CN": "SDK",
      "en-US": "SDK",
    },
  },
  {
    key: "skill",
    path: "/skill",
    basePath: "/skill",
    label: {
      "zh-CN": "Skill",
      "en-US": "Skill",
    },
  },
  {
    key: "demo",
    path: "/playground/ultramodern",
    basePath: "/playground/ultramodern",
    label: {
      "zh-CN": "演示",
      "en-US": "Demos",
    },
  },
];
