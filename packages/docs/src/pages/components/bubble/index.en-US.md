---
title: Bubble
description: Bubble component for chat-style messages.
---

## When To Use

Use this component for chat, Q&A, and message stream UIs.

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/variant-and-shape.vue">Variants and Shapes</demo>
<demo src="./demo/sider-and-placement.vue">Sidebar and Placement</demo>
<demo src="./demo/system.vue">System Bubble</demo>
<demo src="./demo/divider.vue">Divider Bubble</demo>
<demo src="./demo/header.vue">Bubble Header</demo>
<demo src="./demo/footer.vue">Bubble Footer</demo>
<demo src="./demo/loading.vue">Loading</demo>
<demo src="./demo/animation.vue">Animation</demo>
<demo src="./demo/stream.vue">Streaming</demo>
<demo src="./demo/custom-content.vue">Custom Rendered Content</demo>
<demo src="./demo/markdown.vue">Render Markdown Content</demo>
<demo src="./demo/editable.vue">Editable Bubble</demo>
<demo src="./demo/gpt-vis.vue">Render Charts Using GPT-Vis</demo>

## BubbleList Examples

<demo src="./demo/list.vue">Bubble List</demo>
<demo src="./demo/list-scroll.vue">Bubble List Ref</demo>
<demo src="./demo/list-slot-compatible.vue" debug>Slot Compatibility</demo>
<demo src="./demo/semantic-list-custom.vue">Semantic Customization</demo>
<demo src="./demo/list-extra.vue">List Extra</demo>

## API

### Bubble

#### Props

Common props ref：[Common props](/docs/vue/common-props)

| Property          | Description             | Type                                                                                                           | Default                  |
| ----------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `content`         | Bubble content          | `string \| number \| VNode \| object`                                                                          | -                        |
| `placement`       | Bubble placement        | `'start' \| 'end'`                                                                                             | `'start'`                |
| `variant`         | Visual variant          | `'filled' \| 'outlined' \| 'shadow' \| 'borderless'`                                                           | `'filled'`               |
| `shape`           | Bubble shape            | `'default' \| 'round' \| 'corner'`                                                                             | `'default'`              |
| `loading`         | Loading state           | `boolean`                                                                                                      | `false`                  |
| `typing`          | Typing animation config | `boolean \| BubbleAnimationOption \| ((content, info) => ...)`                                                 | `false`                  |
| `streaming`       | Streaming flag          | `boolean`                                                                                                      | `false`                  |
| `editable`        | Editable mode           | `boolean \| EditableBubbleOption`                                                                              | `false`                  |
| `contentRender`   | Custom content render   | `(content, info) => VNodeChild`                                                                                | -                        |
| `loadingRender`   | Custom loading render   | `(content, info) => VNodeChild`                                                                                | -                        |
| `classes`         | Semantic class names    | `Partial<Record<'root' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra', string>>`        | -                        |
| `styles`          | Semantic styles         | `Partial<Record<'root' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra', CSSProperties>>` | -                        |
| `footerPlacement` | Footer render position  | `'outer-start' \| 'outer-end' \| 'inner-start' \| 'inner-end'`                                                 | derived from `placement` |

#### Events

| Event            | Description              | Type                                        |
| ---------------- | ------------------------ | ------------------------------------------- |
| `typing`         | Typing callback          | `(renderedContent, currentContent) => void` |
| `typingComplete` | Typing complete callback | `(content) => void`                         |
| `editConfirm`    | Edit confirm callback    | `(content) => void`                         |
| `editCancel`     | Edit cancel callback     | `() => void`                                |

#### Slots

| Slot            | Description                | Type                                |
| --------------- | -------------------------- | ----------------------------------- |
| `contentRender` | Custom content render slot | `({ content, info }) => VNodeChild` |
| `loadingRender` | Custom loading render slot | `({ content, info }) => VNodeChild` |
| `header`        | Bubble header content      | `(content, info) => VNodeChild`     |
| `footer`        | Bubble footer content      | `(content, info) => VNodeChild`     |
| `avatar`        | Avatar area                | `(content, info) => VNodeChild`     |
| `extra`         | Extra content area         | `(content, info) => VNodeChild`     |

Content render priority: `contentRender` slot > `contentRender` prop > `content` prop.
Loading render priority: `loadingRender` slot > `loadingRender` prop > default Loading.

Prefer `BubbleList`, `BubbleSystem`, and `BubbleDivider` exports. Legacy `Bubble.List`, `Bubble.System`, and `Bubble.Divider` syntax remains compatible.

### BubbleList

#### Props

| Property     | Description                             | Type                                                                                                                                                            | Default |
| ------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `items`      | Bubble data list, `key`/`role` required | `BubbleItemType[]`                                                                                                                                              | -       |
| `autoScroll` | Auto scroll to bottom on new messages   | `boolean`                                                                                                                                                       | `true`  |
| `role`       | Default role config map                 | `RoleType`                                                                                                                                                      | -       |
| `onScroll`   | Scroll callback                         | `(event) => void`                                                                                                                                               | -       |
| `classes`    | Semantic class names                    | `Partial<Record<'root' \| 'scroll' \| 'bubble' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra' \| 'system' \| 'divider', string>>`        | -       |
| `styles`     | Semantic styles                         | `Partial<Record<'root' \| 'scroll' \| 'bubble' \| 'body' \| 'avatar' \| 'header' \| 'content' \| 'footer' \| 'extra' \| 'system' \| 'divider', CSSProperties>>` | -       |

`BubbleList` exposes:

```ts
scrollTo(options: {
  key?: string | number
  top?: number | 'top' | 'bottom'
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
}): void
```

#### Slots

| Slot            | Description                    | Type                                                   |
| --------------- | ------------------------------ | ------------------------------------------------------ |
| `contentRender` | List-level content render slot | `({ content, info, item, index, role }) => VNodeChild` |
| `loadingRender` | List-level loading render slot | `({ content, info, item, index, role }) => VNodeChild` |
| `header`        | List-level header render slot  | `({ content, info, item, index, role }) => VNodeChild` |
| `footer`        | List-level footer render slot  | `({ content, info, item, index, role }) => VNodeChild` |
| `avatar`        | List-level avatar render slot  | `({ content, info, item, index, role }) => VNodeChild` |
| `extra`         | List-level extra render slot   | `({ content, info, item, index, role }) => VNodeChild` |

Priority: list-level same-name slot > matching render props in `items`/`role` > default render.

### BubbleSystem

A system-message style wrapper around `Bubble`, defaulting to `variant='shadow'`.

| Property  | Description          | Type                                                            | Default |
| --------- | -------------------- | --------------------------------------------------------------- | ------- |
| `classes` | Semantic class names | `Partial<Record<'root' \| 'body' \| 'content', string>>`        | -       |
| `styles`  | Semantic styles      | `Partial<Record<'root' \| 'body' \| 'content', CSSProperties>>` | -       |

### BubbleDivider

A divider style wrapper around `Bubble`, forwarding `dividerProps` to `Divider`.

| Property  | Description          | Type                                                            | Default |
| --------- | -------------------- | --------------------------------------------------------------- | ------- |
| `classes` | Semantic class names | `Partial<Record<'root' \| 'body' \| 'content', string>>`        | -       |
| `styles`  | Semantic styles      | `Partial<Record<'root' \| 'body' \| 'content', CSSProperties>>` | -       |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Bubble Semantic DOM</demo>

<demo src="./demo/semantic-system.vue" simplify>BubbleSystem Semantic DOM</demo>

<demo src="./demo/semantic-divider.vue" simplify>BubbleDivider Semantic DOM</demo>

<demo src="./demo/semantic-list.vue" simplify>BubbleList Semantic DOM</demo>
