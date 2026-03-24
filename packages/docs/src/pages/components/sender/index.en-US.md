---
title: Sender
subtitle: Sender
description: A chat input component for sending messages.
---

## When To Use

- When you need to build an input box in a chat scenario

## Examples

<demo src="./demo/agent.vue">Agent</demo>
<demo src="./demo/basic.vue">Basic</demo>
<demo src="./demo/switch.vue">Switch</demo>
<demo src="./demo/slot-filling.vue">Slot Filling</demo>
<demo src="./demo/ref-action.vue">Ref Actions</demo>
<demo src="./demo/submit-type.vue">Submit Type</demo>
<demo src="./demo/speech.vue">Speech Input</demo>
<demo src="./demo/speech-custom.vue">Custom Speech</demo>
<demo src="./demo/suffix.vue">Custom Suffix</demo>
<demo src="./demo/disable-ctrl.vue">Disable Control</demo>
<demo src="./demo/disable-ctrl-slot.vue">Disable Control with Slots</demo>
<demo src="./demo/header.vue">Header Panel</demo>
<demo src="./demo/slot-with-suggestion.vue">Quick Commands</demo>
<demo src="./demo/header-fixed.vue">Reference</demo>
<demo src="./demo/footer.vue">Custom Footer</demo>
<demo src="./demo/send-style.vue">Send Style</demo>
<demo src="./demo/paste-image.vue">Paste Files</demo>
<demo src="./demo/loading.vue">Loading</demo>

## API

### SenderProps

| Property     | Description                   | Type                                                | Default                |
| ------------ | ----------------------------- | --------------------------------------------------- | ---------------------- |
| allowSpeech  | Whether to allow speech input | `boolean \| SpeechConfig`                           | `false`                |
| classNames   | Semantic class names          | `Partial<Record<SemanticType, string>>`             | -                      |
| defaultValue | Default value of input        | `string`                                            | -                      |
| disabled     | Whether disabled              | `boolean`                                           | `false`                |
| loading      | Whether loading               | `boolean`                                           | `false`                |
| suffix       | Suffix content                | `VNodeChild \| false \| NodeRender`                 | Default action buttons |
| header       | Header panel                  | `VNodeChild \| false \| NodeRender`                 | `false`                |
| prefix       | Prefix content                | `VNodeChild \| false \| NodeRender`                 | `false`                |
| footer       | Footer content                | `VNodeChild \| false \| NodeRender`                 | `false`                |
| readOnly     | Whether readonly              | `boolean`                                           | `false`                |
| rootClass    | Root element class            | `string`                                            | -                      |
| styles       | Semantic styles               | `Partial<Record<SemanticType, CSSProperties>>`      | -                      |
| submitType   | Submit mode                   | `'enter' \| 'shiftEnter'`                           | `'enter'`              |
| value        | Input value                   | `string`                                            | -                      |
| placeholder  | Placeholder text              | `string`                                            | -                      |
| autoSize     | Auto height                   | `boolean \| { minRows?: number; maxRows?: number }` | `{ maxRows: 8 }`       |
| onSubmit     | Callback when submit          | `(message: string) => void`                         | -                      |
| onChange     | Callback when value changes   | `(value: string, event?: Event) => void`            | -                      |
| onCancel     | Callback when cancel          | `() => void`                                        | -                      |
| onPaste      | Paste callback                | `(event: ClipboardEvent) => void`                   | -                      |
| onPasteFile  | Paste file callback           | `(files: FileList) => void`                         | -                      |
| onKeyDown    | Keydown callback              | `(event: KeyboardEvent) => void \| false`           | -                      |
| onFocus      | Focus callback                | `(event: FocusEvent) => void`                       | -                      |
| onBlur       | Blur callback                 | `(event: FocusEvent) => void`                       | -                      |

### Sender Ref

| Property      | Description                         | Type                                                              |
| ------------- | ----------------------------------- | ----------------------------------------------------------------- |
| nativeElement | Root container                      | `HTMLDivElement`                                                  |
| focus         | Focus input with cursor positioning | `(options?: SenderFocusOptions) => void`                          |
| blur          | Blur input                          | `() => void`                                                      |
| clear         | Clear content                       | `() => void`                                                      |
| insert        | Insert text                         | `(text: string, position?: 'start' \| 'end' \| 'cursor') => void` |
| getValue      | Get current value                   | `() => { value: string }`                                         |

```typescript
interface SenderFocusOptions extends FocusOptions {
  cursor?: "start" | "end" | "all";
}
```

### Sender.Header

| Property     | Description                      | Type                                                    | Default |
| ------------ | -------------------------------- | ------------------------------------------------------- | ------- |
| title        | Title                            | `VNodeChild`                                            | -       |
| open         | Whether expanded                 | `boolean`                                               | `false` |
| closable     | Whether closable                 | `boolean`                                               | `true`  |
| classNames   | Semantic class names             | `Partial<Record<'header' \| 'content', string>>`        | -       |
| styles       | Semantic styles                  | `Partial<Record<'header' \| 'content', CSSProperties>>` | -       |
| onOpenChange | Callback when open state changes | `(open: boolean) => void`                               | -       |

### Sender.Switch

| Property          | Description                 | Type                         | Default |
| ----------------- | --------------------------- | ---------------------------- | ------- |
| checkedChildren   | Content when checked        | `VNodeChild`                 | -       |
| unCheckedChildren | Content when unchecked      | `VNodeChild`                 | -       |
| icon              | Icon                        | `VNodeChild`                 | -       |
| disabled          | Whether disabled            | `boolean`                    | `false` |
| loading           | Loading state               | `boolean`                    | `false` |
| defaultValue      | Default checked state       | `boolean`                    | `false` |
| value             | Checked value               | `boolean`                    | -       |
| onChange          | Callback when value changes | `(checked: boolean) => void` | -       |
| rootClass         | Root element class          | `string`                     | -       |
