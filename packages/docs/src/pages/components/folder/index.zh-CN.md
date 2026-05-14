---
title: Folder
subtitle: 文件树
description: 用于展示层级文件结构的文件树组件。
---

## 何时使用

- 展示层级文件/文件夹结构。
- 选中文件并预览内容。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/custom-service.vue">自定义文件服务</demo>
<demo src="./demo/file-controlled.vue">受控文件选择</demo>
<demo src="./demo/fully-controlled.vue">完全受控模式</demo>
<demo src="./demo/searchable.vue">可搜索的文件树</demo>
<demo src="./demo/custom-icons.vue">自定义图标</demo>
<demo src="./demo/preview-render.vue">自定义预览内容</demo>
<demo src="./demo/slots.vue">自定义插槽</demo>

## API

### FolderProps

| 属性                      | 说明                                       | 类型                                                                       | 默认值 |
| ------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- | ------ |
| `treeData`                | 文件树数据                                 | [`FolderTreeData[]`](#foldertreedata)                                      | `[]`   |
| `selectable`              | 是否可选择                                 | `boolean`                                                                  | `true` |
| `selectedFile` (v-model)  | 受控选中文件路径                           | `string[]`                                                                 | -      |
| `defaultSelectedFile`     | 默认选中的文件路径                         | `string[]`                                                                 | -      |
| `directoryTreeWith`       | 目录树面板宽度                             | `number \| string`                                                         | `278`  |
| `emptyRender`             | 空状态节点，`false` 不显示                 | `false \| VNodeChild \| (() => VNodeChild)`                                | -      |
| `previewRender`           | 自定义预览内容                             | `VNodeChild \| ((file, info) => VNodeChild)`                               | -      |
| `expandedPaths` (v-model) | 受控展开节点路径                           | `string[]`                                                                 | -      |
| `defaultExpandedPaths`    | 默认展开节点路径                           | `string[]`                                                                 | -      |
| `defaultExpandAll`        | 是否默认展开所有节点                       | `boolean`                                                                  | `true` |
| `fileContentService`      | 文件内容加载服务                           | [`FileContentService`](#filecontentservice)                                | -      |
| `directoryTitle`          | 目录树标题，`false` 不显示                 | `false \| VNodeChild \| (() => VNodeChild)`                                | -      |
| `previewTitle`            | 预览区标题，`false` 不显示                 | `false \| VNodeChild \| ((info: { title; path; content }) => VNodeChild)`  | -      |
| `directoryIcons`          | 以 `"directory"` 或扩展名为 key 的图标映射 | `false \| Record<'directory' \| string, VNodeChild \| (() => VNodeChild)>` | -      |
| `classes`                 | 语义化 class                               | `Partial<Record<FolderSemanticType, string>>`                              | -      |
| `styles`                  | 语义化 style                               | `Partial<Record<FolderSemanticType, CSSProperties>>`                       | -      |

### Folder 事件

| 事件                   | 说明                     | 签名                                                           |
| ---------------------- | ------------------------ | -------------------------------------------------------------- |
| `selectedFileChange`   | 选中文件变化             | `(file: { path: string[]; title?; content?: string }) => void` |
| `update:selectedFile`  | `selectedFile` 双向绑定  | `(paths: string[]) => void`                                    |
| `fileClick`            | 文件被点击               | `(filePath: string, content?: string) => void`                 |
| `folderClick`          | 文件夹被点击             | `(folderPath: string) => void`                                 |
| `expandedPathsChange`  | 展开节点变化             | `(paths: string[]) => void`                                    |
| `update:expandedPaths` | `expandedPaths` 双向绑定 | `(paths: string[]) => void`                                    |

### Folder 插槽

同名插槽优先级高于 prop。

| 插槽             | 说明           | 类型                                                                           |
| ---------------- | -------------- | ------------------------------------------------------------------------------ |
| `directoryTitle` | 目录树标题     | `() => VNodeChild`                                                             |
| `previewTitle`   | 预览区标题     | `(info: { title: VNodeChild; path: string[]; content: string }) => VNodeChild` |
| `previewRender`  | 自定义预览内容 | `(info: { file: PreviewFileInfo; originNode: VNodeChild }) => VNodeChild`      |
| `emptyRender`    | 空状态节点     | `() => VNodeChild`                                                             |

### FolderTreeData

| 属性       | 说明                       | 类型               | 默认值 |
| ---------- | -------------------------- | ------------------ | ------ |
| `title`    | 节点展示标题               | `VNodeChild`       | -      |
| `path`     | 节点路径片段               | `string`           | -      |
| `content`  | 文件内容（仅文件节点有效） | `string`           | -      |
| `children` | 子节点（仅目录节点有效）   | `FolderTreeData[]` | -      |

### FileContentService

```ts
interface FileContentService {
  loadFileContent: (filePath: string) => Promise<string>;
}
```

### FolderSemanticType

```ts
type FolderSemanticType =
  | "root"
  | "directoryTree"
  | "directoryTitle"
  | "filePreview"
  | "previewTitle"
  | "previewRender";
```
