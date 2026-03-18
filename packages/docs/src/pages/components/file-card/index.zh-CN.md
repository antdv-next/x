---
title: FileCard
subtitle: 文件卡片
description: 用卡片的形式展示文件。
---

## 何时使用

- 用于在对话或输入时展示文件。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/size.vue">卡片大小</demo>
<demo src="./demo/image.vue">图片文件</demo>
<demo src="./demo/image-loading.vue">图片加载</demo>
<demo src="./demo/audio.vue">音视频类型</demo>
<demo src="./demo/mask.vue">使用遮罩</demo>
<demo src="./demo/icon.vue">自定义图标</demo>
<demo src="./demo/list.vue">文件列表</demo>
<demo src="./demo/overflow.vue">超出样式</demo>
<demo src="./demo/custom-description.vue">自定义描述</demo>

## API

### FileCard

| 属性          | 说明                                                                                                                             | 类型                                                                                                                                                             | 默认值      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `name`        | 文件名称                                                                                                                         | `string`                                                                                                                                                         | -           |
| `byte`        | 文件大小（字节）                                                                                                                 | `number`                                                                                                                                                         | -           |
| `size`        | 卡片大小                                                                                                                         | `'small' \| 'default'`                                                                                                                                           | `'default'` |
| `description` | 文件描述，支持函数形式获取上下文信息                                                                                             | `VNodeChild \| ((info: { size: string; icon: VNodeChild; namePrefix?: string; nameSuffix?: string; name?: string; src?: string; type?: string }) => VNodeChild)` | -           |
| `loading`     | 是否处于加载状态                                                                                                                 | `boolean`                                                                                                                                                        | `false`     |
| `type`        | 文件类型                                                                                                                         | `'file' \| 'image' \| 'audio' \| 'video' \| string`                                                                                                              | -           |
| `src`         | 图片或文件地址                                                                                                                   | `string`                                                                                                                                                         | -           |
| `mask`        | 遮罩内容，支持函数形式获取上下文信息。对于 `type="image"`，可通过 `imageProps.preview.mask` 配置，此属性仅适用于非图像文件类型。 | `VNodeChild \| ((info: { size: string; icon: VNodeChild; namePrefix?: string; nameSuffix?: string; name?: string; src?: string; type?: string }) => VNodeChild)` | -           |
| `icon`        | 自定义图标                                                                                                                       | `VNodeChild \| PresetIcons`                                                                                                                                      | -           |
| `imageProps`  | 图片属性，参考 [Image](https://antdv-next.antgroup.com/components/image-cn#api)                                                  | `ImageProps`                                                                                                                                                     | -           |
| `videoProps`  | 视频属性配置                                                                                                                     | `Partial<HTMLVideoElement>`                                                                                                                                      | -           |
| `audioProps`  | 音频属性配置                                                                                                                     | `Partial<HTMLAudioElement>`                                                                                                                                      | -           |
| `spinProps`   | 加载中属性，参考 [Spin](https://antdv-next.antgroup.com/components/spin-cn#api)                                                  | `SpinProps & { showText?: boolean; icon?: VNodeChild }`                                                                                                          | -           |
| `onClick`     | 点击事件回调，接收文件信息和点击事件                                                                                             | `(info, event) => void`                                                                                                                                          | -           |
| `classes`     | 语义化 class                                                                                                                     | `Partial<Record<'root' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`                                                                                 | -           |
| `styles`      | 语义化 style                                                                                                                     | `Partial<Record<'root' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>`                                                                          | -           |

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

| 属性        | 说明         | 类型                                                                                              | 默认值      |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------- | ----------- |
| `items`     | 文件列表数据 | `FileCardProps[]`                                                                                 | `[]`        |
| `size`      | 卡片大小     | `'small' \| 'default'`                                                                            | `'default'` |
| `removable` | 是否可删除   | `boolean \| ((item: FileCardProps) => boolean)`                                                   | `false`     |
| `onRemove`  | 删除事件回调 | `(item: FileCardProps) => void`                                                                   | -           |
| `extension` | 扩展内容     | `VNodeChild`                                                                                      | -           |
| `overflow`  | 超出展示方式 | `'scrollX' \| 'scrollY' \| 'wrap'`                                                                | `'wrap'`    |
| `classes`   | 语义化 class | `Partial<Record<'root' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', string>>`        | -           |
| `styles`    | 语义化 style | `Partial<Record<'root' \| 'card' \| 'file' \| 'icon' \| 'name' \| 'description', CSSProperties>>` | -           |
