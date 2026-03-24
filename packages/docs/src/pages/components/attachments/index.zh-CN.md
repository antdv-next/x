---
category: Components
group:
  title: 表达
  order: 2
title: Attachments
subtitle: 输入附件
description: 用于展示一组附件信息集合。
---

## 何时使用

- 需要展示、管理一组上传文件时。
- 需要支持点击上传与拖拽上传时。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/placeholder.vue">占位内容</demo>
<demo src="./demo/overflow.vue">超出样式</demo>
<demo src="./demo/with-sender.vue">组合示例</demo>
<demo src="./demo/select-files.vue">分类型选择文件</demo>

## API

### Attachments

| 属性                    | 说明                                                 | 类型                                                                                                                                     | 默认值  |
| ----------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `items`                 | 附件列表（受控）                                     | `Attachment[]`                                                                                                                           | `[]`    |
| `placeholder`           | 占位内容，支持对象、节点或函数（区分 `inline/drop`） | `PlaceholderType \| ((type: 'inline' \| 'drop') => PlaceholderType)`                                                                     | -       |
| `overflow`              | 文件列表超出时样式                                   | `'wrap' \| 'scrollX' \| 'scrollY'`                                                                                                       | -       |
| `getDropContainer`      | 设置拖拽释放区域                                     | `() => HTMLElement \| null \| undefined`                                                                                                 | -       |
| `disabled`              | 是否禁用                                             | `boolean`                                                                                                                                | `false` |
| `maxCount`              | 最大上传数量                                         | `number`                                                                                                                                 | -       |
| `accept`                | 接受的文件类型                                       | `string`                                                                                                                                 | -       |
| `multiple`              | 是否支持多选                                         | `boolean`                                                                                                                                | `false` |
| `directory`             | 是否支持目录上传                                     | `boolean`                                                                                                                                | `false` |
| `beforeUpload`          | 上传前校验                                           | `(file: File, fileList: File[]) => boolean \| Promise<boolean>`                                                                          | -       |
| `onChange`              | 列表变化回调                                         | `(info: { file: Attachment; fileList: Attachment[] }) => void`                                                                           | -       |
| `onRemove`              | 删除前回调                                           | `(file: Attachment) => boolean \| Promise<boolean>`                                                                                      | -       |
| `openFileDialogOnClick` | 点击时是否打开文件选择框                             | `boolean`                                                                                                                                | `true`  |
| `rootClass`             | 根节点类名                                           | `string`                                                                                                                                 | -       |
| `classes`               | 语义化 class                                         | `Partial<Record<'root' \| 'list' \| 'placeholder' \| 'upload' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`        | -       |
| `styles`                | 语义化 style                                         | `Partial<Record<'root' \| 'list' \| 'placeholder' \| 'upload' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>` | -       |

> Upload 相关能力透传：`action`、`method`、`customRequest`、`withCredentials`。

```ts
interface PlaceholderConfig {
  icon?: VNodeChild;
  title?: VNodeChild;
  description?: VNodeChild;
}

type PlaceholderType = PlaceholderConfig | VNodeChild;
```

```ts
interface Attachment<T = any>
  extends UploadFile<T>, Omit<FileCardProps, "size" | "byte" | "type"> {
  description?: VNodeChild;
  cardType?: FileCardProps["type"];
}
```

### AttachmentsRef

| 属性                | 说明               | 类型                                                          |
| ------------------- | ------------------ | ------------------------------------------------------------- |
| `nativeElement`     | 根节点 DOM         | `HTMLDivElement \| null`                                      |
| `fileNativeElement` | 文件输入 DOM       | `HTMLInputElement \| null`                                    |
| `upload`            | 手工触发上传       | `(file: File) => void`                                        |
| `select`            | 手工打开文件选择器 | `(options?: { accept?: string; multiple?: boolean }) => void` |

## 语义化 DOM

<demo src="./demo/_semantic.vue" simplify>Attachments 语义结构</demo>
