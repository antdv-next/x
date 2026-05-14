---
title: Folder
description: File tree component for displaying hierarchical file structure.
---

## When To Use

- Display hierarchical file/folder structures.
- Combine file selection with content preview.

## Examples

<demo src="./demo/basic.vue">Basic Usage</demo>
<demo src="./demo/custom-service.vue">Custom File Service</demo>
<demo src="./demo/file-controlled.vue">Controlled File Selection</demo>
<demo src="./demo/fully-controlled.vue">Fully Controlled Mode</demo>
<demo src="./demo/searchable.vue">Searchable File Tree</demo>
<demo src="./demo/custom-icons.vue">Custom Icons</demo>
<demo src="./demo/preview-render.vue">Custom Preview Content</demo>
<demo src="./demo/slots.vue">Custom Slots</demo>

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Folder Semantic DOM</demo>

## API

### FolderProps

| Property                  | Description                                       | Type                                                                       | Default |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| `treeData`                | File tree data                                    | [`FolderTreeData[]`](#foldertreedata)                                      | `[]`    |
| `selectable`              | Whether the tree is selectable                    | `boolean`                                                                  | `true`  |
| `selectedFile` (v-model)  | Selected file path (controlled)                   | `string[]`                                                                 | -       |
| `defaultSelectedFile`     | Initial selected file path                        | `string[]`                                                                 | -       |
| `directoryTreeWith`       | Width of the directory tree panel                 | `number \| string`                                                         | `278`   |
| `emptyRender`             | Empty state node, `false` to hide                 | `false \| VNodeChild \| (() => VNodeChild)`                                | -       |
| `previewRender`           | Custom preview content                            | `VNodeChild \| ((file, info) => VNodeChild)`                               | -       |
| `expandedPaths` (v-model) | Expanded node paths (controlled)                  | `string[]`                                                                 | -       |
| `defaultExpandedPaths`    | Initial expanded paths                            | `string[]`                                                                 | -       |
| `defaultExpandAll`        | Whether to expand all nodes by default            | `boolean`                                                                  | `true`  |
| `fileContentService`      | File content loader                               | [`FileContentService`](#filecontentservice)                                | -       |
| `directoryTitle`          | Directory tree title, `false` to hide             | `false \| VNodeChild \| (() => VNodeChild)`                                | -       |
| `previewTitle`            | File preview title, `false` to hide               | `false \| VNodeChild \| ((info: { title; path; content }) => VNodeChild)`  | -       |
| `directoryIcons`          | Icon map keyed by `"directory"` or file extension | `false \| Record<'directory' \| string, VNodeChild \| (() => VNodeChild)>` | -       |
| `classes`                 | Semantic class names                              | `Partial<Record<FolderSemanticType, string>>`                              | -       |
| `styles`                  | Semantic styles                                   | `Partial<Record<FolderSemanticType, CSSProperties>>`                       | -       |

### Folder Events

| Event                  | Description                       | Signature                                                      |
| ---------------------- | --------------------------------- | -------------------------------------------------------------- |
| `selectedFileChange`   | Selected file changed             | `(file: { path: string[]; title?; content?: string }) => void` |
| `update:selectedFile`  | v-model update for `selectedFile` | `(paths: string[]) => void`                                    |
| `fileClick`            | A file was clicked                | `(filePath: string, content?: string) => void`                 |
| `folderClick`          | A folder was clicked              | `(folderPath: string) => void`                                 |
| `expandedPathsChange`  | Expanded paths changed            | `(paths: string[]) => void`                                    |
| `update:expandedPaths` | v-model update for expanded paths | `(paths: string[]) => void`                                    |

### Folder Slots

Slots take precedence over the same-named props.

| Slot             | Description            | Type                                                                           |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `directoryTitle` | Directory tree title   | `() => VNodeChild`                                                             |
| `previewTitle`   | File preview title     | `(info: { title: VNodeChild; path: string[]; content: string }) => VNodeChild` |
| `previewRender`  | Custom preview content | `(info: { file: PreviewFileInfo; originNode: VNodeChild }) => VNodeChild`      |
| `emptyRender`    | Empty state node       | `() => VNodeChild`                                                             |

### FolderTreeData

| Property   | Description                     | Type               | Default |
| ---------- | ------------------------------- | ------------------ | ------- |
| `title`    | Display title                   | `VNodeChild`       | -       |
| `path`     | Node path segment               | `string`           | -       |
| `content`  | File content (file nodes only)  | `string`           | -       |
| `children` | Child nodes (folder nodes only) | `FolderTreeData[]` | -       |

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
