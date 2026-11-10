# 扩展指南

## Components

`components` 是主要扩展入口，可把 Markdown 或自定义 HTML 标签映射到 Vue 组件。

```vue
<script setup>
import { Mermaid, Sources, Think } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";

const components = {
  mermaid: Mermaid,
  think: Think,
  sources: Sources,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

### 传递额外 props

用 `componentsProps` 按标签名传递固定 props。它能保持 `components` 引用稳定，避免额外 props 变化时重新挂载组件。

```vue
<XMarkdown
  :content="content"
  :components="components"
  :components-props="{
    mermaid: { theme: 'dark' },
    'my-chart': { height: 320 },
  }"
/>
```

### 组件映射规则

- `components` 和 `componentsProps` 尽量保持稳定（模块常量或 `computed`）。
- 用 `streamStatus` 区分临时 loading UI 和最终渲染结果。
- 如果自定义组件内部包含块级元素，必要时用 `paragraphTag` 避免非法嵌套。
- 自定义标签应语义明确，避免混乱的 Markdown/HTML 混写。

## 插件

内置插件从 `@antdv-next/x-markdown/plugins/...` 导入，并通过 `config` 接入。

```vue
<script setup>
import Latex from "@antdv-next/x-markdown/plugins/Latex";
import { XMarkdown } from "@antdv-next/x-markdown";

const config = {
  extensions: Latex(),
};
</script>

<template>
  <XMarkdown :content="content" :config="config" />
</template>
```

当需求属于“新增解析语法”时用插件；仅仅是替换已渲染节点的视觉表现时，用 `components` 更合适。

## 主题

先从内置主题样式开始。先引入基础样式，再引入一个主题：

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { XMarkdown } from "@antdv-next/x-markdown";
</script>

<template>
  <XMarkdown class="x-markdown-light" :content="content" />
</template>
```

如果要定制：

1. 保留内置主题类名
2. 额外加一个自定义类名
3. 只覆盖真正需要的 CSS 变量

## 自定义标签建议

- 保持自定义标签结构完整
- 除非语法有意为之，否则避免在自定义 HTML 块内部插入多余空行
- 如果自定义标签内换行需要保留，检查 `protectCustomTagNewlines`（默认 `true`）

## 如何选工具

- 用 `components` 替换渲染后的节点
- 用插件扩展 Markdown 解析能力
- 用主题控制排版、间距和颜色
- 用 `escapeRawHtml` 处理安全，不要拿它做视觉定制；没有 `dompurifyConfig` 属性
