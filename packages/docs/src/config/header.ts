import { version as cardVersion } from "../../../x-card/package.json";
import { version as markdownVersion } from "../../../x-markdown/package.json";
import { version as sdkVersion } from "../../../x-sdk/package.json";
import { version as skillVersion } from "../../../x-skill/package.json";
import { version as xVersion } from "../../../x/package.json";

export interface HeaderItem {
  key: string;
  path: string;
  basePath: string;
  label: Record<"zh-CN" | "en-US", string>;
  version?: string;
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
    version: xVersion,
  },
  {
    key: "markdown",
    path: "/markdown",
    basePath: "/markdown",
    label: {
      "zh-CN": "Markdown",
      "en-US": "Markdown",
    },
    version: markdownVersion,
  },
  {
    key: "card",
    path: "/card",
    basePath: "/card",
    label: {
      "zh-CN": "Card",
      "en-US": "Card",
    },
    version: cardVersion,
  },
  {
    key: "sdk",
    path: "/sdk",
    basePath: "/sdk",
    label: {
      "zh-CN": "SDK",
      "en-US": "SDK",
    },
    version: sdkVersion,
  },
  {
    key: "skill",
    path: "/skill",
    basePath: "/skill",
    label: {
      "zh-CN": "Skill",
      "en-US": "Skill",
    },
    version: skillVersion,
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
