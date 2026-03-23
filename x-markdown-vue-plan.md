# 📦 x-markdown Vue 3 实现方案

## 📌 项目背景

需要将 React 版本的 **x-markdown** 组件库重构为 Vue 3 版本。

x-markdown 是一个：

- 🚀 面向 LLM / AI 场景
- ⚡ 支持流式渲染（streaming）
- 🧩 高度可扩展（组件替换）
- 🔒 内置安全防护（XSS）

的 Markdown 渲染组件。

📁 原项目路径：
/Users/carl-chen/Desktop/oss/x/packages/x-markdown/

---

## 🧱 技术选型对比

| 层级            | React 版本              | Vue 3 版本              |
| --------------- | ----------------------- | ----------------------- |
| 状态管理        | useStreaming hook       | useStreaming composable |
| Markdown → HTML | marked                  | marked（复用）          |
| HTML → 组件     | html-react-parser       | vue3-edit               |
| XSS 防护        | DOMPurify               | DOMPurify（复用）       |
| 动画            | CSS classes + keyframes | Vue `<Transition>`      |

---

## 📁 项目结构

packages/x-markdown-vue/
├── src/
│ ├── XMarkdown/
│ │ ├── index.vue
│ │ ├── interface.ts
│ │ ├── composables/
│ │ │ ├── useStreaming.ts
│ │ │ ├── useParser.ts
│ │ │ ├── useRenderer.ts
│ │ │ └── useTail.ts
│ │ ├── core/
│ │ │ ├── Parser.ts
│ │ │ ├── VueRenderer.ts
│ │ │ └── detectUnclosedComponentTags.ts
│ │ ├── components/
│ │ │ ├── AnimationText.vue
│ │ │ ├── DebugPanel.vue
│ │ │ └── TailIndicator.vue
│ │ └── utils/
│ │ └── tail.ts
│ ├── plugins/
│ │ └── Latex/
│ │ └── index.ts
│ ├── themes/
│ │ ├── light.css
│ │ └── dark.css
│ └── index.ts
├── package.json
└── README.md

---

## ⚙️ 核心实现

### VueRenderer（HTML → Vue）

见实现代码（略）

### useStreaming（流式处理）

见实现代码（略）

---

## 🚧 实现步骤

### Phase 1：基础设施

1. 创建包结构
2. 配置依赖
3. 迁移类型

### Phase 2：核心能力

4. Parser
5. Renderer
6. Streaming
7. 主组件

### Phase 3：组件

8. AnimationText
9. DebugPanel
10. TailIndicator

### Phase 4：插件

11. themes
12. latex
13. streaming 状态

### Phase 5：测试

14. 单测
15. E2E
16. 文档

---

## ✅ 验证方案

- 单元测试（vitest）
- 组件测试
- 流式测试
- E2E
- 快照测试

---

## 💡 优化建议

- SSR 支持
- 插件体系
- 性能优化
- 类型增强
