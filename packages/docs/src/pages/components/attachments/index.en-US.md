---
category: Components
group:
  title: Express
  order: 2
title: Attachments
description: Display the collection of attachment information.
---

## When To Use

- When you need to display and manage a list of uploaded files.
- When you need both click-to-upload and drag-and-drop upload.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/placeholder.vue">Placeholder</demo>
<demo src="./demo/overflow.vue">Overflow</demo>
<demo src="./demo/with-sender.vue">Composition</demo>
<demo src="./demo/select-files.vue">Select Files by Type</demo>

## API

### Attachments

| Property                | Description                                                              | Type                                                                                                                                     | Default |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `items`                 | Controlled attachment list                                               | `Attachment[]`                                                                                                                           | `[]`    |
| `placeholder`           | Placeholder content, supports object, vnode, or function (`inline/drop`) | `PlaceholderType \| ((type: 'inline' \| 'drop') => PlaceholderType)`                                                                     | -       |
| `overflow`              | Layout when file list overflows                                          | `'wrap' \| 'scrollX' \| 'scrollY'`                                                                                                       | -       |
| `getDropContainer`      | Drop target container getter                                             | `() => HTMLElement \| null \| undefined`                                                                                                 | -       |
| `disabled`              | Whether disabled                                                         | `boolean`                                                                                                                                | `false` |
| `maxCount`              | Maximum upload count                                                     | `number`                                                                                                                                 | -       |
| `accept`                | Accepted file types                                                      | `string`                                                                                                                                 | -       |
| `multiple`              | Whether multiple selection is allowed                                    | `boolean`                                                                                                                                | `false` |
| `directory`             | Whether folder upload is allowed                                         | `boolean`                                                                                                                                | `false` |
| `beforeUpload`          | Hook before upload                                                       | `(file: File, fileList: File[]) => boolean \| Promise<boolean>`                                                                          | -       |
| `onChange`              | Callback when list changes                                               | `(info: { file: Attachment; fileList: Attachment[] }) => void`                                                                           | -       |
| `onRemove`              | Hook before remove                                                       | `(file: Attachment) => boolean \| Promise<boolean>`                                                                                      | -       |
| `openFileDialogOnClick` | Whether clicking opens file dialog                                       | `boolean`                                                                                                                                | `true`  |
| `rootClass`             | Root class name                                                          | `string`                                                                                                                                 | -       |
| `classes`               | Semantic class names                                                     | `Partial<Record<'root' \| 'list' \| 'placeholder' \| 'upload' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`        | -       |
| `styles`                | Semantic styles                                                          | `Partial<Record<'root' \| 'list' \| 'placeholder' \| 'upload' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>` | -       |

> Forwarded Upload-related props: `action`, `method`, `customRequest`, `withCredentials`.

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

| Property            | Description               | Type                                                          |
| ------------------- | ------------------------- | ------------------------------------------------------------- |
| `nativeElement`     | Root DOM element          | `HTMLDivElement \| null`                                      |
| `fileNativeElement` | Native file input element | `HTMLInputElement \| null`                                    |
| `upload`            | Trigger upload manually   | `(file: File) => void`                                        |
| `select`            | Open file picker manually | `(options?: { accept?: string; multiple?: boolean }) => void` |

## Semantic DOM

<demo src="./demo/_semantic.vue" simplify>Attachments Semantic DOM</demo>
