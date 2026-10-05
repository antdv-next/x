---
title: MessageScroller
description: A streaming conversation viewport that follows new content, releases control when the reader scrolls away, and offers a rail for jumping between messages.
order: 3
packageName: x-pro
---

## When To Use {#when-to-use}

- When the message list is driven by high-frequency streaming and the viewport must stay pinned to the newest content.
- When the host app needs to know whether the reader is still at the live edge, to drive "back to latest", unread counts, or a linked navigation rail.
- When the transcript holds heterogeneous nodes such as thought chains, tool-call cards, and code sandboxes rather than only chat bubbles.
- When you need to jump to a historical message imperatively, or to restore auto-follow from outside the component.

## Examples {#examples}

<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/follow.vue">Following state</demo>
<demo src="./demo/rail.vue">Message navigation rail</demo>
<demo src="./demo/controller.vue">Imperative scroll control</demo>
<demo src="./demo/slots.vue">Custom rail and preview</demo>
<demo src="./demo/semantic.vue">Semantic styling</demo>

## Following State {#following}

"Am I at the live edge?" is a first-class state of the component:

- The viewport is a native `overflow-y: auto` container, so `wheel`, `touchstart`, arrow keys, and scroll events all feed the same state machine.
- Being within `followThreshold` of the bottom re-enters following; moving past it leaves following.
- A reader gesture that leaves the live edge — an upward wheel or `ArrowUp` / `PageUp` / `Home` — detaches at once, without waiting for the scroll event, and the position check only takes over again once the viewport is observed moving back towards the bottom. That is what keeps one gesture from entering and leaving following over and over, which would make the back-to-latest button blink.
- **While detached, growing streamed content never moves the viewport**, so reading history is never interrupted.
- Dragging the native scrollbar, touch inertia, and keyboard scrolling are all recognized because they surface as the same scroll events.
- State changes are reported through the `followChange` event and the `v-model:follow` binding.

Following and the rail are two independent capabilities of the same viewport and are best enabled together, as in the basic demo. Following on its own is equally valid: the viewport still pins to the bottom, and `backToBottom` becomes the only way back to the live edge.

## Message Navigation Rail {#navigation-rail}

With `navigation="rail"`:

- The rail scans message nodes by `itemSelector` and renders previews from the `items` metadata, falling back to node text when metadata is missing.
- Ticks are attenuated by distance to the highlighted item: 1 at distance 0, 0.68 at distance 1, 0.44 at distance 2, and 0.25 beyond that.
- The preview card is a singleton that slides between active items with `translateY` instead of duplicating DOM per message.
- Active item priority is `hovered ?? pinned ?? focused ?? active`: ticks follow that priority, while the preview card appears only for hover, touch pin, or keyboard focus.
- A touch tap pins the preview until the reader taps outside the rail.
- Clicking any tick but the last one detaches follow and centers that entry; clicking the last one is equivalent to going back to latest.
- The clicked tick becomes the active entry immediately and holds it until that smooth scroll lands: near either end the centering target is clamped to the boundary, so the entry derived from scroll position is not the one the reader picked.
- The rail is rendered only when there are at least two messages and the content overflows the viewport, so a short transcript never grows an empty rail.
- While the rail is enabled, the viewport hides its native scrollbar and reserves space on the inline end; tick height shrinks automatically when the ticks outgrow the viewport.

`itemSelector` may point at any node level: one tick per message is the default shape, and one tick per turn or per tool call works just as well as long as the node carries the matching `id` from `items`.

## API {#api}

### Properties {#properties}

Properties marked ✓ can be configured globally through [`XProProvider`](/pro/introduction#global-config).

| Property        | Description                                                                                    | Type                            | Default               | Version | Global Config |
| --------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- | --------------------- | ------- | ------------- |
| prefixCls       | Component class prefix                                                                         | `string`                        | -                     | -       | ×             |
| rootClass       | Class applied to the component root                                                            | `string`                        | -                     | -       | ×             |
| follow          | Whether the viewport follows the live edge. Controlled, supports `v-model:follow`.             | `boolean`                       | -                     | -       | ✓             |
| followThreshold | Distance from the bottom, in px, that still counts as following                                | `number`                        | `56`                  | -       | ✓             |
| smooth          | Smoothly follow growing content                                                                | `boolean`                       | `true`                | -       | ✓             |
| busy            | The transcript is waiting for more streamed content, mapped to `aria-busy`                     | `boolean`                       | -                     | -       | ✓             |
| navigation      | Adds a message navigation rail                                                                 | `'rail'`                        | -                     | -       | ✓             |
| items           | Preview metadata for rail items, matched to message nodes by `id`                              | `MessageScrollerItem[]`         | -                     | -       | ✓             |
| itemSelector    | Selector for message nodes; the attribute value is the rail item `id`                          | `string`                        | `'[data-message-id]'` | -       | ✓             |
| backToBottom    | Show a back-to-latest button while detached                                                    | `boolean`                       | `false`               | -       | ✓             |
| classes         | Customize class for each semantic structure inside the component. Supports object or function. | `MessageScrollerClassNamesType` | -                     | -       | ✓             |
| styles          | Customize inline style for each semantic structure. Supports object or function.               | `MessageScrollerStylesType`     | -                     | -       | ✓             |

### Events {#events}

| Event          | Description                                | Type                                                         | Version |
| -------------- | ------------------------------------------ | ------------------------------------------------------------ | ------- |
| followChange   | Triggered when the following state changes | `(following: boolean) => void`                               | -       |
| update:follow  | Used by `v-model:follow`                   | `(following: boolean) => void`                               | -       |
| scroll         | Triggered when the viewport scrolls        | `(event: Event) => void`                                     | -       |
| railItemSelect | Triggered when a rail item is selected     | `(id: string \| number, item?: MessageScrollerItem) => void` | -       |

### Slots {#slots}

| Slot         | Description                                                                             | Type                                                                                               | Version |
| ------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| default      | Transcript content; message nodes must carry the attribute referenced by `itemSelector` | `() => any`                                                                                        | -       |
| railItem     | Custom rail tick                                                                        | `(slotProps: { item: MessageScrollerItem, active: boolean, index: number, scale: number }) => any` | -       |
| preview      | Custom rail preview card content                                                        | `(slotProps: { item: MessageScrollerItem, index: number }) => any`                                 | -       |
| backToBottom | Custom back-to-latest button                                                            | `(slotProps: { scrollToEnd: () => void, following: boolean }) => any`                              | -       |

### Methods {#methods}

The component `ref` exposes the following instance API:

| Name            | Description                                                        | Parameters                                                            | Version |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- | ------- |
| scrollToEnd     | Scroll to the bottom                                               | `(options?: { behavior?: ScrollBehavior })`                           | -       |
| scrollToItem    | Scroll a message into the center of the viewport                   | `(target: string \| number, options?: { behavior?: ScrollBehavior })` | -       |
| setFollowing    | Set the following state; setting `true` also scrolls to the bottom | `(following: boolean) => void`                                        | -       |
| following       | Whether the viewport is currently following                        | `boolean`                                                             | -       |
| nativeElement   | Component root element                                             | `HTMLElement \| null`                                                 | -       |
| viewportElement | Native scroll viewport element                                     | `HTMLElement \| null`                                                 | -       |
| contentElement  | Viewport content layer element                                     | `HTMLElement \| null`                                                 | -       |

## Semantic DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>
