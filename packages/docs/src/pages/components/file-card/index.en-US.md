---
title: FileCard
description: Display files in the form of cards.
---

## When To Use

- Used to display files during conversations or input.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/size.vue">Size</demo>
<demo src="./demo/image.vue">Image</demo>
<demo src="./demo/image-loading.vue">Image Load</demo>
<demo src="./demo/audio.vue">Audio/Video</demo>
<demo src="./demo/mask.vue">Mask</demo>
<demo src="./demo/icon.vue">Icon</demo>
<demo src="./demo/list.vue">List</demo>
<demo src="./demo/overflow.vue">Overflow</demo>
<demo src="./demo/custom-description.vue">Custom Description</demo>

## API

### FileCard

| Property      | Description                                                                                                                                                                            | Type                                                                                                                                                             | Default     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `name`        | File name                                                                                                                                                                              | `string`                                                                                                                                                         | -           |
| `byte`        | File size (bytes)                                                                                                                                                                      | `number`                                                                                                                                                         | -           |
| `size`        | Card size                                                                                                                                                                              | `'small' \| 'default'`                                                                                                                                           | `'default'` |
| `description` | File description, supports function form to get context information                                                                                                                    | `VNodeChild \| ((info: { size: string; icon: VNodeChild; namePrefix?: string; nameSuffix?: string; name?: string; src?: string; type?: string }) => VNodeChild)` | -           |
| `loading`     | Loading state                                                                                                                                                                          | `boolean`                                                                                                                                                        | `false`     |
| `type`        | File type                                                                                                                                                                              | `'file' \| 'image' \| 'audio' \| 'video' \| string`                                                                                                              | -           |
| `src`         | Image or file URL                                                                                                                                                                      | `string`                                                                                                                                                         | -           |
| `mask`        | Mask content, supports function form to get context information. For `type="image"`, this is configured via `imageProps.preview.mask`, this prop only applies to non-image file types. | `VNodeChild \| ((info: { size: string; icon: VNodeChild; namePrefix?: string; nameSuffix?: string; name?: string; src?: string; type?: string }) => VNodeChild)` | -           |
| `icon`        | Custom icon                                                                                                                                                                            | `VNodeChild \| PresetIcons`                                                                                                                                      | -           |
| `imageProps`  | Image props configuration, see [Image](https://antdv-next.antgroup.com/components/image#api)                                                                                           | `ImageProps`                                                                                                                                                     | -           |
| `videoProps`  | Video props configuration                                                                                                                                                              | `Partial<HTMLVideoElement>`                                                                                                                                      | -           |
| `audioProps`  | Audio props configuration                                                                                                                                                              | `Partial<HTMLAudioElement>`                                                                                                                                      | -           |
| `spinProps`   | Loading animation props configuration, see [Spin](https://antdv-next.antgroup.com/components/spin#api)                                                                                 | `SpinProps & { showText?: boolean; icon?: VNodeChild }`                                                                                                          | -           |
| `onClick`     | Click event callback, receives file information and click event                                                                                                                        | `(info, event) => void`                                                                                                                                          | -           |
| `classes`     | Semantic class names                                                                                                                                                                   | `Partial<Record<'root' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`                                                                                 | -           |
| `styles`      | Semantic styles                                                                                                                                                                        | `Partial<Record<'root' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>`                                                                          | -           |

### PresetIcons

```ts
type PresetIcons =
  | "default"
  | "excel"
  | "image"
  | "markdown"
  | "pdf"
  | "ppt"
  | "word"
  | "zip"
  | "video"
  | "audio"
  | "java"
  | "javascript"
  | "python";
```

### FileCard.List

| Property    | Description            | Type                                                                                              | Default     |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------- | ----------- |
| `items`     | File list data         | `FileCardProps[]`                                                                                 | `[]`        |
| `size`      | Card size              | `'small' \| 'default'`                                                                            | `'default'` |
| `removable` | Whether removable      | `boolean \| ((item: FileCardProps) => boolean)`                                                   | `false`     |
| `onRemove`  | Remove event callback  | `(item: FileCardProps) => void`                                                                   | -           |
| `extension` | Extension content      | `VNodeChild`                                                                                      | -           |
| `overflow`  | Overflow display style | `'scrollX' \| 'scrollY' \| 'wrap'`                                                                | `'wrap'`    |
| `classes`   | Semantic class names   | `Partial<Record<'root' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`        | -           |
| `styles`    | Semantic styles        | `Partial<Record<'root' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>` | -           |
