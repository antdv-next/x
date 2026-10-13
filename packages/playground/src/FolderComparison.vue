<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

import { Folder } from "@antdv-next/x";
import { ref } from "vue";

const showHover = ref(true);
const enlarged = ref(false);
const expandedPaths = ref(["src", "src/components", "docs"]);
const treeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "components",
        path: "components",
        children: [
          { title: "App.vue", path: "App.vue", content: "<template />" },
          { title: "Folder.vue", path: "Folder.vue", content: "<Folder />" },
        ],
      },
      { title: "main.ts", path: "main.ts", content: "createApp(App);" },
    ],
  },
  {
    title: "docs",
    path: "docs",
    children: [
      { title: "README.md", path: "README.md", content: "# Playground" },
    ],
  },
];
const variants = [
  {
    key: "before",
    title: "修复前",
    description: "Tree 覆盖了 Folder 样式，背景占满 24px。",
  },
  { key: "after", title: "修复后", description: "背景垂直居中，包住箭头。" },
];
</script>

<template>
  <main class="comparison">
    <header>
      <p class="eyebrow">ISSUE #240 / FOLDER</p>
      <h1>展开按钮 hover 背景对比</h1>
      <p>
        看目录名前的小箭头：两边使用同一个 Folder
        组件和相同数据，左侧恢复修复前的定位。 点击箭头可同步展开 /
        收起两边的目录。
      </p>
    </header>

    <div class="controls">
      <label>
        <input v-model="showHover" type="checkbox" />
        同时显示两边的 hover 背景
      </label>
      <label>
        <input v-model="enlarged" type="checkbox" />
        放大 2 倍
      </label>
    </div>
    <p class="hint">
      取消同时显示后，把鼠标移到任意目录的小箭头上，查看真实 hover 效果。
    </p>

    <div class="panels">
      <section v-for="variant in variants" :key="variant.key" class="panel">
        <div class="panel-heading">
          <h2>{{ variant.title }}</h2>
          <p>{{ variant.description }}</p>
        </div>
        <div
          class="folder-stage"
          :class="[variant.key, { 'show-hover': showHover, enlarged }]"
        >
          <Folder
            v-model:expanded-paths="expandedPaths"
            :tree-data="treeData"
            directory-tree-with="65%"
            :preview-title="false"
            style="height: 260px"
          >
            <template #emptyRender>
              <p class="preview-hint">点击文件可预览</p>
            </template>
            <template #previewRender="{ file }">
              <pre class="file-content">{{ file.content }}</pre>
            </template>
          </Folder>
        </div>
        <div class="position-note">
          <code v-if="variant.key === 'before'">top: 0; transform: none;</code>
          <code v-else>top: 50%; transform: translateY(-50%);</code>
        </div>
      </section>
    </div>
    <p class="hint">
      修复前 Tree 样式覆盖了 Folder 的 10px 设置，实际背景为 24 × 24
      px；修复后恢复为 10 × 10 px 并居中。
      “同时显示”仅让背景保持可见；放大选项放大整个示例。
    </p>
  </main>
</template>

<style scoped>
.comparison {
  --border: #d9e2ec;
  --muted: #526579;
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px;
  color: #172b4d;
}

.eyebrow {
  color: #0958d9;
  font: 12px monospace;
  letter-spacing: 0.1em;
}

h1 {
  margin: 12px 0;
  font-size: clamp(24px, 4vw, 32px);
}

header > p:last-child,
.hint {
  color: var(--muted);
  line-height: 1.7;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-top: 24px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  cursor: pointer;
}

.controls input {
  accent-color: #1677ff;
}

.panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.panel {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.panel-heading {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(120deg, #f5f8fc, #fff);
}

h2 {
  margin: 0;
  font-size: 20px;
}

.panel-heading p {
  margin: 8px 0 0;
  color: var(--muted);
}

.folder-stage {
  overflow: auto;
  padding: 20px 0;
}

.enlarged :deep(.antd-folder) {
  zoom: 2;
  min-width: 300px;
}

/* Restore the computed Tree styles from before this fix, including its overrides. */
.before :deep(.antd-folder .ant-tree .ant-tree-switcher) {
  width: var(--ant-tree-switcher-size);
}

.before :deep(.antd-folder .ant-tree .ant-tree-switcher::before) {
  width: var(--ant-tree-switcher-size);
  height: var(--ant-tree-title-height);
  top: 0;
  transform: none;
}

/* Keep the original hover visible so the offset is easy to compare. */
.show-hover :deep(.ant-tree-switcher:not(.ant-tree-switcher-noop)::before) {
  background-color: rgba(0, 0, 0, 0.06);
}

.position-note {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: #f8fafc;
  overflow-wrap: anywhere;
}

.preview-hint {
  color: var(--muted);
  font-size: 12px;
}

.file-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 800px) {
  .panels {
    grid-template-columns: 1fr;
  }
}
</style>
