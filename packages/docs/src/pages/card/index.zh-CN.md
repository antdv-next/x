---
order: 1
title: 介绍
packageName: x-card
---

`@antdv-next/x-card` 是一个面向 A2UI 协议的动态卡片渲染运行时，用于将 Agent 输出的结构化命令流渲染为可交互的 Vue 组件树。

## 核心能力

- 流式命令消费：按顺序处理 `createSurface / updateComponents / updateDataModel / deleteSurface`
- 声明式组件渲染：通过组件注册表把协议节点映射为真实组件
- 数据绑定：支持路径读写与 Action 回写
- 协议隔离：按 `surfaceId` 维护独立运行时上下文

## 安装

<InstallDependencies npm='npm install @antdv-next/x-card' yarn='yarn add @antdv-next/x-card' pnpm='pnpm install @antdv-next/x-card' bun='bun add @antdv-next/x-card'></InstallDependencies>

## 快速开始

```tsx
import { defineComponent, ref } from "vue";
import XCard from "@antdv-next/x-card";

const Text = defineComponent({
  props: { text: String },
  setup: props => () => <div>{props.text}</div>,
});

export default defineComponent({
  setup() {
    const commands = ref([
      {
        version: "v0.9",
        createSurface: { surfaceId: "demo" },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "demo",
          components: [
            {
              id: "root",
              component: "Text",
              text: "Hello XCard",
            },
          ],
        },
      },
    ]);

    return () => (
      <XCard.Box commands={commands.value} components={{ Text }}>
        <XCard id="demo" />
      </XCard.Box>
    );
  },
});
```
