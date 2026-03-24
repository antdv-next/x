# @antdv-next/x-markdown

Vue 3 流式友好、强拓展性和高性能的 Markdown 渲染器。

## ✨ 特性

使用 [`marked`](https://github.com/markedjs/marked) 作为基础 markdown 渲染器，具备 marked 的所有特性。

- 🚀 为速度而生
- 🤖 流式友好，大模型 Markdown 渲染解决方案
- ⬇️ 低级编译器，用于解析 Markdown，无需长时间缓存
- ⚖️ 轻量级，实现所有支持的 Markdown 风格
- 🔐 默认安全，DOMPurify 防护 XSS 攻击
- 🎨 可自定义组件，支持传入自定义 Vue 组件替换任意 Markdown 元素
- 🔧 丰富的插件生态
- 😊 兼容，100% 符合 CommonMark，100% 符合 GFM 插件

## 兼容环境

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Opera |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| >= 92                                                                                                                                                                                                  | >= 90                                                                                                                                                                                                              | >= 92                                                                                                                                                                                                          | >= 15.4                                                                                                                                                                                                        | >= 78                                                                                                                                                                                                      |

## 支持的 Markdown 规范

- [Markdown 1.0.0](https://daringfireball.net/projects/markdown/)
- [CommonMark](https://github.com/commonmark/commonmark-spec/wiki/Markdown-Flavors)
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)

## 📦 安装

```bash
npm install @antdv-next/x-markdown
```

```bash
yarn add @antdv-next/x-markdown
```

```bash
pnpm add @antdv-next/x-markdown
```

## 示例

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `
# Hello World

### 欢迎使用 XMarkdown！

- 项目1
- 项目2
- 项目3
`;
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### 流式渲染示例

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = ref("");
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
});

// 模拟流式输入
function onChunk(chunk) {
  content.value += chunk;
}
</script>

<template>
  <XMarkdown :content="content" :streaming="streaming" />
</template>
```

## API

### Props

| 属性                     | 说明                                 | 类型                        | 默认值          |
| ------------------------ | ------------------------------------ | --------------------------- | --------------- |
| content                  | 需要渲染的 Markdown 内容             | `string`                    | -               |
| components               | 将 HTML 节点映射为自定义 Vue 组件    | `Record<string, Component>` | -               |
| streaming                | 流式渲染行为配置                     | `StreamingOption`           | -               |
| config                   | Marked 解析配置                      | `MarkedConfig`              | `{ gfm: true }` |
| className                | 根容器的额外 CSS 类名                | `string`                    | -               |
| style                    | 根容器的内联样式                     | `Record<string, string>`    | -               |
| paragraphTag             | 段落使用的 HTML 标签                 | `string`                    | `'p'`           |
| openLinksInNewTab        | 是否为所有链接添加 `target="_blank"` | `boolean`                   | `true`          |
| protectCustomTagNewlines | 是否保留自定义标签内部的换行         | `boolean`                   | `true`          |
| escapeRawHtml            | 是否将原始 HTML 转义为纯文本         | `boolean`                   | `false`         |
| debug                    | 是否开启调试模式                     | `boolean`                   | `false`         |

### StreamingOption

| 字段                           | 说明                            | 类型                                 | 默认值  |
| ------------------------------ | ------------------------------- | ------------------------------------ | ------- |
| hasNextChunk                   | 是否还有后续内容块              | `boolean`                            | `false` |
| enableAnimation                | 是否启用淡入动画                | `boolean`                            | `true`  |
| animationConfig                | 动画配置                        | `AnimationConfig`                    | -       |
| tail                           | 是否启用尾部指示器              | `boolean \| TailConfig`              | `false` |
| incompleteMarkdownComponentMap | 将未闭合片段映射到 loading 组件 | `Partial<Record<TokenType, string>>` | -       |

### AnimationConfig

| 属性         | 说明             | 类型     | 默认值       |
| ------------ | ---------------- | -------- | ------------ |
| fadeDuration | 动画时长（毫秒） | `number` | `300`        |
| easing       | 缓动函数         | `string` | `'ease-out'` |

### TailConfig

| 属性      | 说明           | 类型        | 默认值 |
| --------- | -------------- | ----------- | ------ |
| content   | 尾部显示的内容 | `string`    | `'▋'`  |
| component | 自定义尾部组件 | `Component` | -      |

## 主题

引入主题样式并设置主题类名：

```vue
<script setup>
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

内置主题：

- `light.css` - 浅色主题
- `dark.css` - 深色主题

## 插件

提供丰富的插件，详见文档。
