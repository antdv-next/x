# API 参考

汇总 `@antdv-next/x` 各组件的属性、事件、插槽和 ref。类型均从 `@antdv-next/x` 导出。

> 回调属性（`onXxx`）也可以使用同名 camelCase 事件监听（`@item-click` ≡ `:on-item-click`）。

## Bubble

| 属性                                     | 类型                                                                                      | 默认值      | 说明                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------- |
| `content`                                | `BubbleContentType`                                                                       | —（必填）   | `string \| number \| VNode \| object`               |
| `placement`                              | `'start' \| 'end'`                                                                        | `'start'`   | 左（AI）或右（用户）                                |
| `loading`                                | `boolean`                                                                                 | `false`     | 加载骨架                                            |
| `loadingRender`                          | `() => VNodeChild \| (content, info) => VNodeChild`                                       | —           | 自定义加载渲染                                      |
| `contentRender`                          | `(content, info: Info) => VNodeChild`                                                     | —           | 自定义内容渲染                                      |
| `editable`                               | `boolean \| EditableBubbleOption`                                                         | `false`     | 行内编辑                                            |
| `typing`                                 | `boolean \| BubbleAnimationOption \| (content, info) => boolean \| BubbleAnimationOption` | —           | 打字动画                                            |
| `streaming`                              | `boolean`                                                                                 | —           | 流式状态                                            |
| `variant`                                | `'filled' \| 'outlined' \| 'shadow' \| 'borderless'`                                      | `'filled'`  | 视觉变体                                            |
| `shape`                                  | `'default' \| 'round' \| 'corner'`                                                        | `'default'` | 圆角形状                                            |
| `footerPlacement`                        | `'outer-start' \| 'outer-end' \| 'inner-start' \| 'inner-end'`                            | —           | 底部位置                                            |
| `header` / `footer` / `avatar` / `extra` | `BubbleSlot`                                                                              | —           | 插槽节点或渲染函数                                  |
| `info`                                   | `Info`                                                                                    | —           | 传给渲染函数和插槽，含 `status`、`key`、`extraInfo` |

**事件（属性）**：`onTyping(rendererContent, currentContent)`、`onTypingComplete(content)`、`onEditConfirm(content)`、`onEditCancel()`。

**插槽**（均接收 `{ content, info }`）：`content`、`loading`、`header`、`footer`、`avatar`、`extra`。

**Ref**：`nativeElement`。

## BubbleList

| 属性         | 类型               | 默认值    | 说明                                                                          |
| ------------ | ------------------ | --------- | ----------------------------------------------------------------------------- |
| `items`      | `BubbleItemType[]` | —（必填） | 每项需要 `key` 和 `role`                                                      |
| `role`       | `RoleType`         | —         | 角色名 → 属性（或 `(item) => 属性`）；内置：`ai`、`system`、`user`、`divider` |
| `autoScroll` | `boolean`          | `true`    | 新消息自动滚动                                                                |
| `onScroll`   | `(event) => void`  | —         | 滚动监听                                                                      |

**插槽**：`contentRender`、`loadingRender`、`avatar`、`header`、`footer`、`extra`。

**Ref**：`nativeElement`、`scrollBoxNativeElement`、`scrollTo({ key, top, behavior, block })`。

## Sender

| 属性                                      | 类型                                | 默认值    | 说明                   |
| ----------------------------------------- | ----------------------------------- | --------- | ---------------------- |
| `value`（v-model）                        | `string`                            | —         | 受控值                 |
| `defaultValue`                            | `string`                            | —         | 非受控初始值           |
| `loading`                                 | `boolean`                           | `false`   | 显示取消而不是发送     |
| `readOnly` / `disabled`                   | `boolean`                           | `false`   | 禁止编辑               |
| `submitType`                              | `'enter' \| 'shiftEnter'`           | `'enter'` | 提交触发方式           |
| `allowSpeech`                             | `AllowSpeech`                       | —         | 语音输入               |
| `slotConfig`                              | `SlotConfigType[]`                  | —         | 结构化插槽输入         |
| `skill`                                   | `SkillType`                         | —         | 输入框中显示的技能标签 |
| `prefix` / `suffix` / `header` / `footer` | `VNodeChild \| false \| NodeRender` | —         | 布局区域               |
| `autoSize`                                | `boolean \| { minRows, maxRows }`   | —         | 文本域自动高度         |
| `placeholder`                             | `string`                            | —         | 占位文本               |

**事件（属性）**：`onSubmit(message, slotConfig?, skill?)`、`onChange(value, event?, slotConfig?, skill?)`、`onCancel()`、`onKeyDown(event)`（返回 `false` 阻止默认行为）、`onKeyUp(event)`、`onPaste(event, info)`、`onPasteFile(files)`、`onCopy(event, info)`、`onCut(event, info)`、`onFocus(event)`、`onBlur(event)`。

**Ref**：`nativeElement`、`focus(options?)`、`blur()`、`clear()`、`insert(value, position?, replaceCharacters?)`、`getValue()`。

### SenderHeader

| 属性           | 类型                      | 默认值  | 说明             |
| -------------- | ------------------------- | ------- | ---------------- |
| `open`         | `boolean`                 | `false` | 展开状态         |
| `onOpenChange` | `(open: boolean) => void` | —       | 切换回调         |
| `title`        | `VNodeChild`              | —       | 面板标题         |
| `closable`     | `boolean`                 | `true`  | 显示关闭按钮     |
| `forceRender`  | `boolean`                 | `false` | 折叠时仍渲染内容 |

## Attachments

继承上传能力（`accept`、`action`、`method`、`directory`、`multiple`、`maxCount`、`disabled`）。

| 属性               | 类型                                           | 默认值 | 说明         |
| ------------------ | ---------------------------------------------- | ------ | ------------ |
| `items`（v-model） | `Attachment[]`                                 | —      | 受控文件列表 |
| `overflow`         | `'scrollX' \| 'scrollY' \| 'wrap'`             | —      | 列表溢出模式 |
| `placeholder`      | `PlaceholderType \| (type) => PlaceholderType` | —      | 空状态内容   |
| `getDropContainer` | `() => HTMLElement \| null \| undefined`       | —      | 拖放区域     |

**事件**：`change({ file, fileList })`、`update:items`。

**Ref**：`select({ accept, multiple })`、`upload(file)`、`nativeElement`、`fileNativeElement`。

**插槽**：`placeholder`、`placeholderIcon`、`placeholderTitle`、`placeholderDescription`。

## Conversations

| 属性                         | 类型                                                       | 默认值  | 说明                            |
| ---------------------------- | ---------------------------------------------------------- | ------- | ------------------------------- |
| `items`                      | `ItemType[]`                                               | —       | `ConversationItemType` 或分隔项 |
| `activeKey`（v-model）       | `string`                                                   | —       | 受控选中项                      |
| `defaultActiveKey`           | `string`                                                   | —       | 非受控初始选中项                |
| `groupable`                  | `boolean \| GroupableProps`                                | `false` | 按 `item.group` 分组            |
| `creation`                   | `CreationProps`                                            | —       | 「新建对话」按钮配置            |
| `menu`                       | `ConversationsItemMenu \| (item) => ConversationsItemMenu` | —       | 每项下拉菜单                    |
| `shortcutKeys`               | `{ creation?, items? }`                                    | —       | 键盘快捷键                      |
| `labelRender` / `iconRender` | `ConversationItemRender`                                   | —       | 自定义条目渲染                  |
| `groupLabelRender`           | `GroupLabelRender`                                         | —       | 自定义分组标题                  |

**事件**：`update:activeKey(key)`、`expand`（分组折叠）。

**Ref**：`nativeElement`。

## Welcome

| 属性          | 类型                       | 默认值     | 说明     |
| ------------- | -------------------------- | ---------- | -------- |
| `icon`        | `VNodeChild`               | —          | 应用图标 |
| `title`       | `VNodeChild`               | —          | 主标题   |
| `description` | `VNodeChild`               | —          | 描述     |
| `extra`       | `VNodeChild`               | —          | 额外操作 |
| `variant`     | `'filled' \| 'borderless'` | `'filled'` | 视觉变体 |

**插槽**：`icon`、`title`、`description`、`extra`。

**Ref**：`nativeElement`。

## Prompts

| 属性                    | 类型                | 默认值  | 说明                                                          |
| ----------------------- | ------------------- | ------- | ------------------------------------------------------------- |
| `items`                 | `PromptsItemType[]` | —       | `key`、`label`、`description`、`icon`、`disabled`、`children` |
| `title`                 | `VNodeChild`        | —       | 区块标题                                                      |
| `wrap`                  | `boolean`           | `false` | 溢出换行                                                      |
| `vertical`              | `boolean`           | `false` | 垂直排列                                                      |
| `fadeIn` / `fadeInLeft` | `boolean`           | `false` | 入场动画                                                      |

**事件**：`itemClick(info: { data })`。

**插槽**：`title`、`labelRender`、`description`、`iconRender`（条目插槽接收 `{ item, index, nested, originNode }`）。

**Ref**：`nativeElement`。

## Think

| 属性                  | 类型                    | 默认值  | 说明                   |
| --------------------- | ----------------------- | ------- | ---------------------- |
| `title`               | `VNodeChild`            | —       | 头部标题               |
| `icon`                | `VNodeChild`            | —       | 非加载状态的自定义图标 |
| `loading`             | `boolean \| VNodeChild` | `false` | 加载指示器             |
| `expanded`（v-model） | `boolean`               | —       | 受控展开               |
| `defaultExpanded`     | `boolean`               | —       | 初始展开               |
| `blink`               | `boolean`               | `false` | 闪烁动画               |
| `destroyOnHidden`     | `boolean`               | `true`  | 折叠时销毁内容         |

**事件**：`update:expanded`、`expand`。

**插槽**：默认（内容主体）。

**Ref**：`nativeElement`。

## ThoughtChain

| 属性                      | 类型                                         | 默认值    | 说明                                                                                                            |
| ------------------------- | -------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `items`                   | `ThoughtChainItemType[]`                     | —         | `key`、`title`、`description`、`content`、`footer`、`status`、`icon`、`collapsible`、`blink`、`destroyOnHidden` |
| `expandedKeys`（v-model） | `string[]`                                   | —         | 受控展开                                                                                                        |
| `defaultExpandedKeys`     | `string[]`                                   | —         | 初始展开                                                                                                        |
| `line`                    | `boolean \| 'solid' \| 'dashed' \| 'dotted'` | `'solid'` | 连接线样式                                                                                                      |

**事件**：`update:expandedKeys`、`expand`。

**插槽**：`iconRender`、`title`、`description`、`content`、`footer`（带条目状态作用域）。

**Ref**：`nativeElement`。

## Actions

| 属性                    | 类型                                     | 默认值         | 说明                                                                        |
| ----------------------- | ---------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `items`                 | `ItemType[]`                             | —              | `key`、`label`、`icon`、`onItemClick`、`danger`、`subItems`、`actionRender` |
| `onClick`               | `(menuInfo: ActionsClickInfo) => void`   | —              | 全局点击处理                                                                |
| `variant`               | `'borderless' \| 'outlined' \| 'filled'` | `'borderless'` | 视觉变体                                                                    |
| `dropdownProps`         | `DropdownProps`                          | —              | 子菜单下拉配置                                                              |
| `fadeIn` / `fadeInLeft` | `boolean`                                | `false`        | 入场动画                                                                    |

**子组件**：

| 组件              | 属性                                                              |
| ----------------- | ----------------------------------------------------------------- |
| `ActionsCopy`     | `text?`、`icon?`                                                  |
| `ActionsFeedback` | `value?`（`'like' \| 'dislike' \| 'default'`）、`onChange(value)` |
| `ActionsAudio`    | `status?`（`'default' \| 'loading' \| 'error' \| 'running'`）     |
| `ActionsItem`     | 通用 `ItemType` 字段                                              |

## Sources

| 属性                  | 类型               | 默认值    | 说明                                         |
| --------------------- | ------------------ | --------- | -------------------------------------------- |
| `items`               | `SourcesItem[]`    | —         | `key`、`title`、`url`、`icon`、`description` |
| `title`               | `VNodeChild`       | —         | 区块标题                                     |
| `expanded`（v-model） | `boolean`          | —         | 受控展开                                     |
| `defaultExpanded`     | `boolean`          | `false`   | 初始展开                                     |
| `inline`              | `boolean`          | `false`   | 行内紧凑模式                                 |
| `activeKey`           | `string \| number` | —         | 行内弹层当前来源                             |
| `popoverOverlayWidth` | `number \| string` | —         | 弹层宽度                                     |
| `expandIconPosition`  | `'start' \| 'end'` | `'start'` | 展开图标位置                                 |
| `onClick`             | `(item) => void`   | —         | 来源点击回调                                 |

**事件**：`update:expanded`、`expand`。

**插槽**：`title`、`titleRender`、`iconRender`、`description`（条目插槽接收 `{ item, index, originNode }`）、默认（`items` 为空时的兜底）。

**Ref**：`nativeElement`。

## Suggestion

| 属性              | 类型                                              | 默认值    | 说明                                          |
| ----------------- | ------------------------------------------------- | --------- | --------------------------------------------- |
| `items`           | `SuggestionItem[] \| (info?) => SuggestionItem[]` | —（必填） | `label`、`value`、`icon`、`children`、`extra` |
| `open`（v-model） | `boolean`                                         | —         | 受控弹层可见性                                |
| `block`           | `boolean`                                         | `false`   | 全宽弹层                                      |

**事件**：`select(value: string, selected: SuggestionItem[])`、`update:open`、`openChange`。

**默认作用域插槽**：`{ onTrigger, onKeyDown, open }` —— 调用 `onTrigger(false)` 关闭。

## FileCard

| 属性                                       | 类型                              | 默认值      | 说明                               |
| ------------------------------------------ | --------------------------------- | ----------- | ---------------------------------- |
| `name`                                     | `string`                          | —（必填）   | 文件名                             |
| `byte`                                     | `number`                          | —           | 文件大小（字节）                   |
| `size`                                     | `'small' \| 'default'`            | `'default'` | 卡片尺寸                           |
| `description`                              | `ExtendNode`                      | —           | 自定义描述                         |
| `loading`                                  | `boolean`                         | `false`     | 加载状态                           |
| `src`                                      | `string`                          | —           | 预览源                             |
| `type`                                     | `string`                          | —           | 文件类型（image/audio/video/file） |
| `mask`                                     | `ExtendNode`                      | —           | 遮罩内容                           |
| `icon`                                     | `VNodeChild`                      | —           | 自定义图标                         |
| `imageProps` / `videoProps` / `audioProps` | object                            | —           | 原生媒体属性                       |
| `onClick`                                  | `(info: CardInfo, event) => void` | —           | 卡片点击                           |

### FileCardList

| 属性        | 类型                               | 默认值      | 说明         |
| ----------- | ---------------------------------- | ----------- | ------------ |
| `items`     | `FileCardProps[]`                  | —（必填）   | 文件卡片     |
| `size`      | `'small' \| 'default'`             | `'default'` | 卡片尺寸     |
| `removable` | `boolean \| (item) => boolean`     | `false`     | 显示移除按钮 |
| `onRemove`  | `(item) => void`                   | —           | 移除回调     |
| `extension` | `VNodeChild`                       | —           | 额外节点     |
| `overflow`  | `'scrollX' \| 'scrollY' \| 'wrap'` | —           | 溢出模式     |

## CodeHighlighter

| 属性               | 类型                | 默认值    | 说明         |
| ------------------ | ------------------- | --------- | ------------ |
| `content`          | `string`            | —（必填） | 代码文本     |
| `language`         | `string`            | —         | 语言标识     |
| `showLineNumbers`  | `boolean`           | `true`    | 显示行号     |
| `showLanguage`     | `boolean`           | `true`    | 显示语言标签 |
| `showThemeToggle`  | `boolean`           | `false`   | 主题切换按钮 |
| `showCopyButton`   | `boolean`           | `true`    | 复制按钮     |
| `theme`（v-model） | `'light' \| 'dark'` | —         | 颜色主题     |
| `startLineNumber`  | `number`            | `1`       | 起始行号     |
| `onCopy`           | `(content) => void` | —         | 复制回调     |

`setupCodeHighlighter` 用于注册额外的 Shiki 语言。

## Mermaid

| 属性                    | 类型                                       | 默认值    | 说明                    |
| ----------------------- | ------------------------------------------ | --------- | ----------------------- |
| `content`               | `string`                                   | —（必填） | Mermaid 源码            |
| `renderType`（v-model） | `'image' \| 'code'`（`MermaidRenderType`） | —         | 渲染模式                |
| `defaultRenderType`     | `MermaidRenderType`                        | `'image'` | 初始渲染模式            |
| `header`                | `VNodeChild \| null`                       | —         | 自定义头部；`null` 隐藏 |
| `config`                | `MermaidConfig`                            | —         | Mermaid 配置            |
| `actions`               | `MermaidActions`                           | —         | 头部操作配置            |
| `codeHighlighterProps`  | `Partial<CodeHighlighterProps>`            | —         | 代码视图选项            |

**事件**：`update:renderType`、`renderTypeChange`。

**插槽**：`header`（带 `renderType`、`setRenderType`、缩放、下载、复制作用域）。

## Folder

| 属性                       | 类型                                              | 默认值    | 说明                                   |
| -------------------------- | ------------------------------------------------- | --------- | -------------------------------------- |
| `treeData`                 | `FolderTreeData[]`                                | —（必填） | `title`、`path`、`content`、`children` |
| `selectedFile`（v-model）  | `string[]`                                        | —         | 选中路径                               |
| `defaultSelectedFile`      | `string[]`                                        | —         | 初始选中路径                           |
| `expandedPaths`（v-model） | `string[]`                                        | —         | 展开路径                               |
| `defaultExpandedPaths`     | `string[]`                                        | —         | 初始展开路径                           |
| `defaultExpandAll`         | `boolean`                                         | `true`    | 默认展开全部                           |
| `fileContentService`       | `{ loadFileContent(path): Promise<string> }`      | —         | 懒加载内容                             |
| `selectable`               | `boolean`                                         | `true`    | 启用选择                               |
| `directoryTitle`           | `false \| null \| VNodeChild \| () => VNodeChild` | —         | 文件树上方标题                         |
| `directoryIcons`           | `false \| Record<string, Renderer>`               | —         | 按类型自定义图标                       |
| `previewRender`            | `PreviewRender`                                   | —         | 自定义文件预览                         |
| `previewTitle`             | `PreviewTitleRender`                              | —         | 自定义预览标题                         |
| `emptyRender`              | `EmptyRender`                                     | —         | 空状态                                 |

**事件**：`selectedFileChange({ path, title, content })`、`fileClick(path, content?)`、`folderClick(path)`、`expandedPathsChange(paths)`、`update:selectedFile`、`update:expandedPaths`。

**插槽**：`directoryTitle`、`previewTitle`、`previewRender`、`emptyRender`。

**Ref**：`nativeElement`。

## XProvider

| 属性                                                                                                                                                                                         | 类型        | 说明                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------- |
| `theme`                                                                                                                                                                                      | 主题配置    | 主题 token                                |
| `locale`                                                                                                                                                                                     | locale 对象 | 语言包（可直接传 `antdv-next` 的 locale） |
| `iconPrefixCls`                                                                                                                                                                              | `string`    | 图标类名前缀                              |
| `attachments` / `actions` / `bubble` / `conversations` / `fileCard` / `sources` / `codeHighlighter` / `mermaid` / `prompts` / `suggestion` / `sender` / `think` / `thoughtChain` / `welcome` | object      | 各组件族的默认配置                        |

其他 `ConfigProvider` 属性（包括 `direction`）均可透传。

## Notification

`Notification` 是从 `@antdv-next/x` 导出的默认 `XNotification` 实例。

| 方法                | 签名                                       | 说明         |
| ------------------- | ------------------------------------------ | ------------ |
| `open`              | `(options: XNotificationOpenArgs) => void` | 显示系统通知 |
| `close`             | `() => void`                               | 关闭当前通知 |
| `requestPermission` | `() => Promise<NotificationPermission>`    | 请求系统权限 |
| `permission`        | `NotificationPermission`                   | 当前权限状态 |

`XNotificationOpenArgs` 在浏览器原生 `NotificationOptions`（`body`、`icon`、`badge`、`tag` 等）基础上扩展了 `title: string`、`duration?`、`onClick?`、`onClose?`、`onError?`、`onShow?`。

**组合式 API**：`useNotification()` 返回 `[{ permission }, { open, close, requestPermission }]`。
