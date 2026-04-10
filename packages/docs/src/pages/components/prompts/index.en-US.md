---
title: Prompts
subtitle: Prompt Set
description: Display a predefined set of questions or suggestions relevant to the current context.
---

## When To Use

- Display a set of preset questions or guiding suggestions to users before a conversation starts
- Guide users to quickly enter a specific topic or scenario
- Provide multiple selectable prompt items to lower the barrier for user input

## Examples

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/disabled.vue">Disabled</demo>
<demo src="./demo/vertical.vue">Vertical</demo>
<demo src="./demo/wrap.vue">Wrap</demo>
<demo src="./demo/nest.vue">Nest Usage</demo>
<demo src="./demo/fade-in.vue">Fade In Effect</demo>
<demo src="./demo/render-slot.vue">Slot Render</demo>

## API

### PromptsProps

| Property     | Description                                                 | Type                                           | Default |
| ------------ | ----------------------------------------------------------- | ---------------------------------------------- | ------- |
| `items`      | List of prompt items                                        | `PromptsItemType[]`                            | -       |
| `title`      | Title displayed at the top of the prompt list               | `VNodeChild`                                   | -       |
| `vertical`   | When set to `true`, the prompts will be arranged vertically | `boolean`                                      | `false` |
| `wrap`       | When set to `true`, the prompts will wrap automatically     | `boolean`                                      | `false` |
| `fadeIn`     | Fade in effect                                              | `boolean`                                      | -       |
| `fadeInLeft` | Fade in from left effect                                    | `boolean`                                      | -       |
| `styles`     | Semantic structure styles                                   | `Partial<Record<SemanticType, CSSProperties>>` | -       |
| `classes`    | Semantic structure classNames                               | `Partial<Record<SemanticType, string>>`        | -       |
| `rootClass`  | Root node class name                                        | `string`                                       | -       |
| `prefixCls`  | Prefix for style class names                                | `string`                                       | -       |

### Events

| Event       | Description                        | Type                               |
| ----------- | ---------------------------------- | ---------------------------------- |
| `itemClick` | Triggered when a prompt is clicked | `(info: PromptsClickInfo) => void` |

### PromptsItemType

| Property      | Description                                         | Type                    | Default |
| ------------- | --------------------------------------------------- | ----------------------- | ------- |
| `key`         | Unique identifier to distinguish each prompt item   | `string \| number`      | -       |
| `label`       | Prompt label displaying the main content            | `VNodeChild`            | -       |
| `description` | Prompt description providing additional information | `VNodeChild`            | -       |
| `icon`        | Prompt icon displayed on the left side              | `VNodeChild`            | -       |
| `disabled`    | When set to `true`, click events are disabled       | `boolean`               | `false` |
| `children`    | Nested child prompt items                           | `BasePromptsItemType[]` | -       |

### PromptsClickInfo

| Property | Description              | Type             |
| -------- | ------------------------ | ---------------- |
| `data`   | Data of the clicked item | `PromptDataItem` |

### SemanticType

```ts
type SemanticType =
  | "root"
  | "list"
  | "item"
  | "itemContent"
  | "title"
  | "subList"
  | "subItem";
```

### Slots

| Slot Name     | Description             | Type                                                  |
| ------------- | ----------------------- | ----------------------------------------------------- |
| `title`       | Top title slot          | `({ originNode }) => VNodeChild`                      |
| `labelRender` | Prompt label slot       | `({ item, originNode, index, nested }) => VNodeChild` |
| `description` | Prompt description slot | `({ item, originNode, index, nested }) => VNodeChild` |
| `iconRender`  | Prompt icon slot        | `({ item, originNode, index, nested }) => VNodeChild` |

Slots take precedence over prop content and apply to both root items and nested child items.

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>Semantic DOM for Prompts</demo>
