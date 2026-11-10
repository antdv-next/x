# API Reference

Consolidated props, events, slots, and refs for every `@antdv-next/x` component family. Most types are exported from `@antdv-next/x`; when a helper type is not re-exported, derive it from the component props (for example `NonNullable<BubbleListProps["role"]>`).

> Declared callback props use the `:on-xxx` form (`:on-submit`). Emit-only events use `@kebab-case` (`@item-click`, `@change`); `:on-xxx` does not register emit-only listeners.

## Bubble

| Prop                                     | Type                                                                                      | Default      | Description                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| `content`                                | `BubbleContentType`                                                                       | — (required) | `string \| number \| VNode \| object`                                |
| `placement`                              | `'start' \| 'end'`                                                                        | `'start'`    | Left (AI) or right (user)                                            |
| `loading`                                | `boolean`                                                                                 | `false`      | Loading skeleton                                                     |
| `loadingRender`                          | `() => VNodeChild \| (content, info) => VNodeChild`                                       | —            | Custom loading renderer                                              |
| `contentRender`                          | `(content, info: Info) => VNodeChild`                                                     | —            | Custom content renderer                                              |
| `editable`                               | `boolean \| EditableBubbleOption`                                                         | `false`      | Inline editing                                                       |
| `typing`                                 | `boolean \| BubbleAnimationOption \| (content, info) => boolean \| BubbleAnimationOption` | —            | Typing animation                                                     |
| `streaming`                              | `boolean`                                                                                 | —            | Streaming state                                                      |
| `variant`                                | `'filled' \| 'outlined' \| 'shadow' \| 'borderless'`                                      | `'filled'`   | Visual variant                                                       |
| `shape`                                  | `'default' \| 'round' \| 'corner'`                                                        | `'default'`  | Corner shape                                                         |
| `footerPlacement`                        | `'outer-start' \| 'outer-end' \| 'inner-start' \| 'inner-end'`                            | —            | Footer position                                                      |
| `header` / `footer` / `avatar` / `extra` | `BubbleSlot`                                                                              | —            | Slot nodes or render functions                                       |
| `info`                                   | `Info`                                                                                    | —            | Passed to renderers and slots; includes `status`, `key`, `extraInfo` |

**Events (props)**: `onTyping(rendererContent, currentContent)`, `onTypingComplete(content)`, `onEditConfirm(content)`, `onEditCancel()`.

**Slots** (each receives `{ content, info }`): `content`, `loading`, `header`, `footer`, `avatar`, `extra`.

**Ref**: `nativeElement`.

## BubbleList

| Prop         | Type                      | Default      | Description                                                                            |
| ------------ | ------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `items`      | `BubbleItemType[]`        | — (required) | Each item needs `key` and `role`                                                       |
| `role`       | `BubbleListProps["role"]` | —            | Role name → props (or `(item) => props`); built-ins: `ai`, `system`, `user`, `divider` |
| `autoScroll` | `boolean`                 | `true`       | Auto-scroll on new messages                                                            |
| `onScroll`   | `(event) => void`         | —            | Scroll listener                                                                        |

**Slots**: `contentRender`, `loadingRender`, `avatar`, `header`, `footer`, `extra`.

**Ref**: `nativeElement`, `scrollBoxNativeElement`, `scrollTo({ key, top, behavior, block })`.

## Sender

| Prop                                      | Type                                | Default   | Description                 |
| ----------------------------------------- | ----------------------------------- | --------- | --------------------------- |
| `value` (v-model)                         | `string`                            | —         | Controlled value            |
| `defaultValue`                            | `string`                            | —         | Uncontrolled initial value  |
| `loading`                                 | `boolean`                           | `false`   | Show cancel instead of send |
| `readOnly` / `disabled`                   | `boolean`                           | `false`   | Prevent editing             |
| `submitType`                              | `'enter' \| 'shiftEnter'`           | `'enter'` | Submit trigger              |
| `allowSpeech`                             | `AllowSpeech`                       | —         | Voice input                 |
| `slotConfig`                              | `SlotConfigType[]`                  | —         | Structured slot input       |
| `skill`                                   | `SkillType`                         | —         | Skill chip shown in input   |
| `prefix` / `suffix` / `header` / `footer` | `VNodeChild \| false \| NodeRender` | —         | Layout areas                |
| `autoSize`                                | `boolean \| { minRows, maxRows }`   | —         | Textarea auto-resize        |
| `placeholder`                             | `string`                            | —         | Placeholder text            |

**Events (props)**: `onSubmit(message, slotConfig?, skill?)`, `onChange(value, event?, slotConfig?, skill?)`, `onCancel()`, `onKeyDown(event)` (return `false` to prevent default), `onKeyUp(event)`, `onPaste(event, info)`, `onPasteFile(files)`, `onCopy(event, info)`, `onCut(event, info)`, `onFocus(event)`, `onBlur(event)`.

**Ref**: `nativeElement`, `focus(options?)`, `blur()`, `clear()`, `insert(value, position?, replaceCharacters?)`, `getValue()`.

### SenderHeader

| Prop           | Type                      | Default | Description                    |
| -------------- | ------------------------- | ------- | ------------------------------ |
| `open`         | `boolean`                 | `false` | Expanded state                 |
| `onOpenChange` | `(open: boolean) => void` | —       | Toggle callback                |
| `title`        | `VNodeChild`              | —       | Panel title                    |
| `closable`     | `boolean`                 | `true`  | Show close button              |
| `forceRender`  | `boolean`                 | `false` | Render content while collapsed |

## Attachments

Extends the upload feature set (`accept`, `action`, `method`, `directory`, `multiple`, `maxCount`, `disabled`).

| Prop               | Type                                           | Default | Description          |
| ------------------ | ---------------------------------------------- | ------- | -------------------- |
| `items` (v-model)  | `Attachment[]`                                 | —       | Controlled file list |
| `overflow`         | `'scrollX' \| 'scrollY' \| 'wrap'`             | —       | List overflow mode   |
| `placeholder`      | `PlaceholderType \| (type) => PlaceholderType` | —       | Empty-state content  |
| `getDropContainer` | `() => HTMLElement \| null \| undefined`       | —       | Drop zone            |

**Events**: `change({ file, fileList })`, `update:items`.

**Ref**: `select({ accept, multiple })`, `upload(file)`, `nativeElement`, `fileNativeElement`.

**Slots**: `placeholder`, `placeholderIcon`, `placeholderTitle`, `placeholderDescription`.

## Conversations

| Prop                         | Type                                                       | Default | Description                             |
| ---------------------------- | ---------------------------------------------------------- | ------- | --------------------------------------- |
| `items`                      | `ItemType[]`                                               | —       | `ConversationItemType` or divider items |
| `activeKey` (v-model)        | `string`                                                   | —       | Controlled selection                    |
| `defaultActiveKey`           | `string`                                                   | —       | Uncontrolled initial selection          |
| `groupable`                  | `boolean \| GroupableProps`                                | `false` | Group by `item.group`                   |
| `creation`                   | `CreationProps`                                            | —       | "New Chat" button config                |
| `menu`                       | `ConversationsItemMenu \| (item) => ConversationsItemMenu` | —       | Per-item dropdown                       |
| `shortcutKeys`               | `{ creation?, items? }`                                    | —       | Keyboard shortcuts                      |
| `labelRender` / `iconRender` | `ConversationItemRender`                                   | —       | Custom item renderers                   |
| `groupLabelRender`           | `GroupLabelRender`                                         | —       | Custom group label                      |

**Events**: `update:activeKey(key)`, `expand` (group collapse).

**Ref**: `nativeElement`.

## Welcome

| Prop          | Type                       | Default    | Description    |
| ------------- | -------------------------- | ---------- | -------------- |
| `icon`        | `VNodeChild`               | —          | App icon       |
| `title`       | `VNodeChild`               | —          | Main title     |
| `description` | `VNodeChild`               | —          | Description    |
| `extra`       | `VNodeChild`               | —          | Extra actions  |
| `variant`     | `'filled' \| 'borderless'` | `'filled'` | Visual variant |

**Slots**: `icon`, `title`, `description`, `extra`.

**Ref**: `nativeElement`.

## Prompts

| Prop                    | Type                | Default | Description                                                   |
| ----------------------- | ------------------- | ------- | ------------------------------------------------------------- |
| `items`                 | `PromptsItemType[]` | —       | `key`, `label`, `description`, `icon`, `disabled`, `children` |
| `title`                 | `VNodeChild`        | —       | Section heading                                               |
| `wrap`                  | `boolean`           | `false` | Wrap on overflow                                              |
| `vertical`              | `boolean`           | `false` | Stack vertically                                              |
| `fadeIn` / `fadeInLeft` | `boolean`           | `false` | Entrance animation                                            |

**Event**: `itemClick(info: { data })`.

**Slots**: `title`, `labelRender`, `description`, `iconRender` (item slots receive `{ item, index, nested, originNode }`).

**Ref**: `nativeElement`.

## Think

| Prop                 | Type                    | Default | Description                    |
| -------------------- | ----------------------- | ------- | ------------------------------ |
| `title`              | `VNodeChild`            | —       | Header title                   |
| `icon`               | `VNodeChild`            | —       | Custom icon when not loading   |
| `loading`            | `boolean \| VNodeChild` | `false` | Loading indicator              |
| `expanded` (v-model) | `boolean`               | —       | Controlled expansion           |
| `defaultExpanded`    | `boolean`               | —       | Initial expansion              |
| `blink`              | `boolean`               | `false` | Shimmer animation              |
| `destroyOnHidden`    | `boolean`               | `true`  | Destroy content when collapsed |

**Events**: `update:expanded`, `expand`.

**Slot**: default (body content).

**Ref**: `nativeElement`.

## ThoughtChain

| Prop                     | Type                                         | Default   | Description                                                                                                     |
| ------------------------ | -------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `items`                  | `ThoughtChainItemType[]`                     | —         | `key`, `title`, `description`, `content`, `footer`, `status`, `icon`, `collapsible`, `blink`, `destroyOnHidden` |
| `expandedKeys` (v-model) | `string[]`                                   | —         | Controlled expansion                                                                                            |
| `defaultExpandedKeys`    | `string[]`                                   | —         | Initial expansion                                                                                               |
| `line`                   | `boolean \| 'solid' \| 'dashed' \| 'dotted'` | `'solid'` | Connector line                                                                                                  |

**Events**: `update:expandedKeys`, `expand`.

**Slots**: `iconRender`, `title`, `description`, `content`, `footer` (scoped with item state).

**Ref**: `nativeElement`.

## Actions

| Prop                    | Type                                     | Default        | Description                                                                 |
| ----------------------- | ---------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| `items`                 | `ItemType[]`                             | —              | `key`, `label`, `icon`, `onItemClick`, `danger`, `subItems`, `actionRender` |
| `onClick`               | `(menuInfo: ActionsClickInfo) => void`   | —              | Global click handler                                                        |
| `variant`               | `'borderless' \| 'outlined' \| 'filled'` | `'borderless'` | Visual variant                                                              |
| `dropdownProps`         | `DropdownProps`                          | —              | Submenu dropdown config                                                     |
| `fadeIn` / `fadeInLeft` | `boolean`                                | `false`        | Entrance animation                                                          |

**Sub-components**:

| Component         | Props                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ActionsCopy`     | `text?`, `icon?`                                                                                                 |
| `ActionsFeedback` | `value?` (`'like' \| 'dislike' \| 'default'`), `onChange(value)`                                                 |
| `ActionsAudio`    | `status?` (`'default' \| 'loading' \| 'error' \| 'running'`)                                                     |
| `ActionsItem`     | `status?` (`'default' \| 'loading' \| 'error' \| 'running'`), `defaultIcon` (required), `label?`, `runningIcon?` |

## Sources

| Prop                  | Type                    | Default   | Description                                                        |
| --------------------- | ----------------------- | --------- | ------------------------------------------------------------------ |
| `items`               | `SourcesProps["items"]` | —         | Each item: `key`, `title` (required), `url`, `icon`, `description` |
| `title`               | `VNodeChild`            | —         | Section heading                                                    |
| `expanded` (v-model)  | `boolean`               | —         | Controlled expansion                                               |
| `defaultExpanded`     | `boolean`               | `true`    | Initial expansion                                                  |
| `inline`              | `boolean`               | `false`   | Inline compact mode                                                |
| `activeKey`           | `string \| number`      | —         | Active source for inline popover                                   |
| `popoverOverlayWidth` | `number \| string`      | —         | Popover width                                                      |
| `expandIconPosition`  | `'start' \| 'end'`      | `'start'` | Expand icon side                                                   |
| `onClick`             | `(item) => void`        | —         | Source click callback                                              |

**Events**: `update:expanded`, `expand`.

**Slots**: `title`, `titleRender`, `iconRender`, `description` (item slots receive `{ item, index, originNode }`), default (fallback when `items` is not provided).

**Ref**: `nativeElement`.

## Suggestion

| Prop             | Type                                              | Default      | Description                                   |
| ---------------- | ------------------------------------------------- | ------------ | --------------------------------------------- |
| `items`          | `SuggestionItem[] \| (info?) => SuggestionItem[]` | — (required) | `label`, `value`, `icon`, `children`, `extra` |
| `open` (v-model) | `boolean`                                         | —            | Controlled popup visibility                   |
| `block`          | `boolean`                                         | `false`      | Full-width popup                              |

**Events**: `select(value: string, selected: SuggestionItem[])`, `update:open`, `openChange`.

**Default scoped slot**: `{ onTrigger, onKeyDown, open }` — call `onTrigger(false)` to close.

## FileCard

| Prop                                       | Type                              | Default      | Description                        |
| ------------------------------------------ | --------------------------------- | ------------ | ---------------------------------- |
| `name`                                     | `string`                          | — (required) | File name                          |
| `byte`                                     | `number`                          | —            | File size in bytes                 |
| `size`                                     | `'small' \| 'default'`            | `'default'`  | Card size                          |
| `description`                              | `ExtendNode`                      | —            | Custom description                 |
| `loading`                                  | `boolean`                         | `false`      | Loading state                      |
| `src`                                      | `string`                          | —            | Preview source                     |
| `type`                                     | `string`                          | —            | File type (image/audio/video/file) |
| `mask`                                     | `ExtendNode`                      | —            | Overlay content                    |
| `icon`                                     | `VNodeChild`                      | —            | Custom icon                        |
| `imageProps` / `videoProps` / `audioProps` | object                            | —            | Native media props                 |
| `onClick`                                  | `(info: CardInfo, event) => void` | —            | Card click                         |

### FileCardList

| Prop        | Type                               | Default      | Description        |
| ----------- | ---------------------------------- | ------------ | ------------------ |
| `items`     | `FileCardProps[]`                  | — (required) | File cards         |
| `size`      | `'small' \| 'default'`             | `'default'`  | Card size          |
| `removable` | `boolean \| (item) => boolean`     | `false`      | Show remove button |
| `onRemove`  | `(item) => void`                   | —            | Remove callback    |
| `extension` | `VNodeChild`                       | —            | Extra node         |
| `overflow`  | `'scrollX' \| 'scrollY' \| 'wrap'` | —            | Overflow mode      |

## CodeHighlighter

| Prop              | Type                | Default      | Description         |
| ----------------- | ------------------- | ------------ | ------------------- |
| `content`         | `string`            | — (required) | Code text           |
| `language`        | `string`            | —            | Language id         |
| `showLineNumbers` | `boolean`           | `true`       | Line numbers        |
| `showLanguage`    | `boolean`           | `true`       | Language label      |
| `showThemeToggle` | `boolean`           | `false`      | Theme toggle button |
| `showCopyButton`  | `boolean`           | `true`       | Copy button         |
| `theme` (v-model) | `'light' \| 'dark'` | —            | Color theme         |
| `startLineNumber` | `number`            | `1`          | First line number   |
| `onCopy`          | `(content) => void` | —            | Copy callback       |

`setupCodeHighlighter` registers additional Shiki languages.

## Mermaid

| Prop                   | Type                                      | Default      | Description                    |
| ---------------------- | ----------------------------------------- | ------------ | ------------------------------ |
| `content`              | `string`                                  | — (required) | Mermaid source                 |
| `renderType` (v-model) | `'image' \| 'code'` (`MermaidRenderType`) | —            | Render mode                    |
| `defaultRenderType`    | `MermaidRenderType`                       | `'image'`    | Initial render mode            |
| `header`               | `VNodeChild \| null`                      | —            | Custom header; `null` hides it |
| `config`               | `MermaidConfig`                           | —            | Mermaid config                 |
| `actions`              | `MermaidActions`                          | —            | Header actions config          |
| `codeHighlighterProps` | `Partial<CodeHighlighterProps>`           | —            | Code view options              |

**Events**: `update:renderType`, `renderTypeChange`.

**Slot**: `header` (scoped with `renderType`, `setRenderType`, zoom, download, copy).

## Folder

| Prop                      | Type                                              | Default      | Description                            |
| ------------------------- | ------------------------------------------------- | ------------ | -------------------------------------- |
| `treeData`                | `FolderTreeData[]`                                | — (required) | `title`, `path`, `content`, `children` |
| `selectedFile` (v-model)  | `string[]`                                        | —            | Selected path                          |
| `defaultSelectedFile`     | `string[]`                                        | —            | Initial selected path                  |
| `expandedPaths` (v-model) | `string[]`                                        | —            | Expanded paths                         |
| `defaultExpandedPaths`    | `string[]`                                        | —            | Initial expanded paths                 |
| `defaultExpandAll`        | `boolean`                                         | `true`       | Expand everything initially            |
| `fileContentService`      | `{ loadFileContent(path): Promise<string> }`      | —            | Lazy content loader                    |
| `selectable`              | `boolean`                                         | `true`       | Enable selection                       |
| `directoryTitle`          | `false \| null \| VNodeChild \| () => VNodeChild` | —            | Title above the tree                   |
| `directoryIcons`          | `false \| Record<string, Renderer>`               | —            | Per-type icons                         |
| `previewRender`           | `PreviewRender`                                   | —            | Custom file preview                    |
| `previewTitle`            | `PreviewTitleRender`                              | —            | Custom preview title                   |
| `emptyRender`             | `EmptyRender`                                     | —            | Empty state                            |

**Events**: `selectedFileChange({ path, title, content })`, `fileClick(path, content?)`, `folderClick(path)`, `expandedPathsChange(paths)`, `update:selectedFile`, `update:expandedPaths`.

**Slots**: `directoryTitle`, `previewTitle`, `previewRender`, `emptyRender`.

**Ref**: `nativeElement`.

## XProvider

| Prop                                                                                                                                                                                         | Type          | Description                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------ |
| `theme`                                                                                                                                                                                      | theme config  | Theme tokens                               |
| `locale`                                                                                                                                                                                     | locale object | Locale (pass `antdv-next` locale directly) |
| `iconPrefixCls`                                                                                                                                                                              | `string`      | Icon class prefix                          |
| `attachments` / `actions` / `bubble` / `conversations` / `fileCard` / `sources` / `codeHighlighter` / `mermaid` / `prompts` / `suggestion` / `sender` / `think` / `thoughtChain` / `welcome` | object        | Defaults for each component family         |

All other `ConfigProvider` props (including `direction`) pass through.

## Notification

`Notification` is the default `XNotification` instance exported from `@antdv-next/x`.

| Method              | Signature                                  | Description                                                     |
| ------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `open`              | `(options: XNotificationOpenArgs) => void` | Show a system notification                                      |
| `close`             | `(tags?: string[]) => void`                | Close the given notifications; **all** when called without tags |
| `requestPermission` | `() => Promise<NotificationPermission>`    | Request OS permission                                           |
| `permission`        | `NotificationPermission`                   | Current permission state                                        |

`XNotificationOpenArgs` extends the native `NotificationOptions` (`body`, `icon`, `badge`, `tag`, …) with `title: string`, `duration?`, `onClick?`, `onClose?`, `onError?`, `onShow?`.

**Composable**: `Notification.useNotification()` returns `[{ permission }, { open, close, requestPermission }]`. There is no standalone `useNotification` export.
