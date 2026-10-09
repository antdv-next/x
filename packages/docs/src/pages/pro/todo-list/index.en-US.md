---
title: TodoList
description: A collapsible task plan for agents that shows each step's progress through morphing status icons, collapses once every task finishes, and re-opens when new work arrives.
order: 4
packageName: x-pro
---

## When To Use {#when-to-use}

- When an agent states its plan before executing and the reader needs to see what is running, how much is done, and what is left at a glance.
- When plan entries update their status as execution proceeds (pending → in-progress → completed / cancelled) and those transitions need clear visual feedback.
- When the plan can grow long and needs a capped, scrollable height that follows new steps automatically.
- When the panel should collapse itself once the work is done to free up space, yet stay collapsed when the reader closed it deliberately.

## Examples {#examples}

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/status.vue">Status and progress</demo>
<demo src="./demo/streaming.vue">Streaming execution</demo>
<demo src="./demo/control.vue">Controlled open state</demo>
<demo src="./demo/slots.vue">Custom row content</demo>
<demo src="./demo/semantic.vue">Semantic styling</demo>

## Status {#status}

Every entry has one of four statuses. They share a single SVG whose shape is switched by a status class:

- `pending` — a dashed circle, meaning not started;
- `in-progress` — a progress arc plus an endlessly rotating ring, with `progress` (0–100) driving the arc length;
- `completed` — a checkmark drawn in with `stroke-dashoffset`;
- `cancelled` — a cross, drawn the same way.

A missing status defaults to `pending`. The header icon does not invent a separate animation: it reuses the same icon with a status derived from the list — `in-progress` if any task is running, otherwise `completed` or `cancelled` once everything is terminal, and `pending` otherwise.

## Auto Collapse And Expand {#collapse}

This is the part of the component most worth reading carefully:

- **Collapsing is triggered by "nothing left to do", not by "everything completed".** The counter shows `completed / total` (successes only), but the list collapses when every item reaches a terminal state — `completed` **or** `cancelled` — and the list is non-empty. A plan of "3 done + 1 cancelled" collapses; requiring a literal "all completed" would leave a finished run open forever.
- **An empty list never collapses**: having no tasks is not the same as having finished them.
- **Auto-expand only undoes a collapse it caused itself.** The component records whether the current collapse came from auto-collapse, and a manual toggle clears that mark. So once the reader has collapsed the panel, a new task will not push it open — otherwise the host could not express "keep it closed" through this prop.
- Set `collapseOnComplete` to `false` to turn the whole behavior off.

## Scroll Following {#scroll-follow}

Adding an entry smooth-scrolls the container to the bottom so the newest task stays visible; removing one never yanks the viewport down. Nothing scrolls while collapsed. Under `prefers-reduced-motion` the scroll becomes instant.

## API {#api}

### Properties {#properties}

Properties marked ✓ can be configured globally through [`XProProvider`](/pro/introduction#global-config).

| Property           | Description                                                                                    | Type                     | Default    | Version | Global Config |
| ------------------ | ---------------------------------------------------------------------------------------------- | ------------------------ | ---------- | ------- | ------------- |
| prefixCls          | Component class prefix                                                                         | `string`                 | -          | -       | ×             |
| rootClass          | Class applied to the component root                                                            | `string`                 | -          | -       | ×             |
| items              | Task entries                                                                                   | `TodoItem[]`             | -          | -       | ×             |
| title              | Header title                                                                                   | `string`                 | `'To-dos'` | -       | ✓             |
| open               | Whether the list is open. Controlled, supports `v-model:open`.                                 | `boolean`                | -          | -       | ✓             |
| defaultOpen        | Initial open state (uncontrolled)                                                              | `boolean`                | `true`     | -       | ✓             |
| collapseOnComplete | Collapse automatically once every task reaches a terminal state                                | `boolean`                | `true`     | -       | ✓             |
| maxHeight          | Max height of the task list in px, scrolling beyond it                                         | `number`                 | `248`      | -       | ✓             |
| classes            | Customize class for each semantic structure inside the component. Supports object or function. | `TodoListClassNamesType` | -          | -       | ✓             |
| styles             | Customize inline style for each semantic structure. Supports object or function.               | `TodoListStylesType`     | -          | -       | ✓             |

### TodoItem {#todo-item}

| Field    | Description                                                         | Type                                                       | Default     |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | ----------- |
| id       | Stable identifier used for list diffing and scroll targeting        | `string`                                                   | -           |
| title    | Task title                                                          | `string`                                                   | -           |
| status   | Task status                                                         | `'pending' \| 'in-progress' \| 'completed' \| 'cancelled'` | `'pending'` |
| progress | Task progress, 0–100, rendered as the arc only while `in-progress`  | `number`                                                   | -           |
| detail   | Compact metadata at the row end, such as elapsed time or file count | `string`                                                   | -           |

### Events {#events}

| Event       | Description                           | Type                      | Version |
| ----------- | ------------------------------------- | ------------------------- | ------- |
| openChange  | Triggered when the open state changes | `(open: boolean) => void` | -       |
| update:open | Used by `v-model:open`                | `(open: boolean) => void` | -       |

### Slots {#slots}

| Slot       | Description                                        | Type                                                                                              | Version |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------- |
| header     | Custom header title                                | `(slotProps: { open: boolean, completed: number, total: number, status: TodoItemStatus }) => any` | -       |
| itemTitle  | Custom row title, taking precedence over the prop  | `(slotProps: { item: TodoItem, index: number, status: TodoItemStatus }) => any`                   | -       |
| itemDetail | Custom row detail, taking precedence over the prop | `(slotProps: { item: TodoItem, index: number, status: TodoItemStatus }) => any`                   | -       |

### Methods {#methods}

The component `ref` exposes the following instance API:

| Name            | Description            | Parameters                                          | Version |
| --------------- | ---------------------- | --------------------------------------------------- | ------- |
| setOpen         | Set the open state     | `(open: boolean) => void`                           | -       |
| scrollToEnd     | Scroll to the bottom   | `(options?: { behavior?: ScrollBehavior }) => void` | -       |
| open            | Whether it is open     | `boolean`                                           | -       |
| nativeElement   | Component root element | `HTMLElement \| null`                               | -       |
| viewportElement | Scroll container       | `HTMLElement \| null`                               | -       |

## Semantic DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>
