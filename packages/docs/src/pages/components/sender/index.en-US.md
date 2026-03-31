---
title: Sender
subtitle: Sender
description: A chat input component for sending messages.
---

## When To Use

- When you need to build an input box for chat scenarios

## Examples

<demo src="./demo/agent.vue">Agent Input</demo>
<demo src="./demo/basic.vue">Basic Usage</demo>
<demo src="./demo/switch.vue">Feature Toggle</demo>
<demo src="./demo/slot-filling.vue">Slot Mode</demo>
<demo src="./demo/ref-action.vue">Instance Methods</demo>
<demo src="./demo/submit-type.vue">Submit Methods</demo>
<demo src="./demo/speech.vue">Voice Input</demo>
<demo src="./demo/speech-custom.vue">Custom Voice Input</demo>
<demo src="./demo/suffix.vue">Custom Suffix</demo>
<demo src="./demo/layout-slots.vue">Layout Slots</demo>
<demo src="./demo/disable-ctrl.vue">Disable Ctrl</demo>
<demo src="./demo/disable-ctrl-slot.vue">Disable Ctrl with Slots</demo>
<demo src="./demo/header.vue">Expand Panel</demo>
<demo src="./demo/header-title-slot.vue">Header Title Slot</demo>
<demo src="./demo/switch-slots.vue">Switch Slots</demo>
<demo src="./demo/slot-with-suggestion.vue">Quick Commands</demo>
<demo src="./demo/header-fixed.vue">References</demo>
<demo src="./demo/footer.vue">Custom Footer Content</demo>
<demo src="./demo/send-style.vue">Style Adjustment</demo>
<demo src="./demo/paste-image.vue">Paste Files</demo>
<demo src="./demo/loading.vue">Loading</demo>

## API

### SenderProps

| Property     | Description                                                                                                       | Type                                                                                       | Default                |
| ------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| allowSpeech  | Whether to allow voice input                                                                                      | `boolean \| SpeechConfig`                                                                  | `false`                |
| classNames   | Style class names                                                                                                 | `Partial<Record<SemanticType, string>>`                                                    | -                      |
| defaultValue | Default value of the input box                                                                                    | `string`                                                                                   | -                      |
| disabled     | Whether to disable                                                                                                | `boolean`                                                                                  | `false`                |
| loading      | Whether in loading state                                                                                          | `boolean`                                                                                  | `false`                |
| suffix       | Suffix content, displays action buttons by default. Set `false` to hide default action buttons                    | `VNodeChild \| false \| NodeRender`                                                        | Default action buttons |
| header       | Header panel                                                                                                      | `VNodeChild \| false \| NodeRender`                                                        | `false`                |
| prefix       | Prefix content                                                                                                    | `VNodeChild \| false \| NodeRender`                                                        | `false`                |
| footer       | Footer content                                                                                                    | `VNodeChild \| false \| NodeRender`                                                        | `false`                |
| readOnly     | Whether to make the input box read-only                                                                           | `boolean`                                                                                  | `false`                |
| rootClass    | Root element style class                                                                                          | `string`                                                                                   | -                      |
| styles       | Semantic style definition                                                                                         | `Partial<Record<SemanticType, CSSProperties>>`                                             | -                      |
| submitType   | Submission mode                                                                                                   | `'enter' \| 'shiftEnter'`                                                                  | `'enter'`              |
| value        | Input box value                                                                                                   | `string`                                                                                   | -                      |
| onSubmit     | Callback for clicking the send button                                                                             | `(message: string, slotConfig?: SlotConfigType[], skill?: SkillType) => void`              | -                      |
| onChange     | Callback for input box value change                                                                               | `(value: string, event?: Event, slotConfig?: SlotConfigType[], skill?: SkillType) => void` | -                      |
| onCancel     | Callback for clicking the cancel button                                                                           | `() => void`                                                                               | -                      |
| onPaste      | Callback for pasting                                                                                              | `(event: ClipboardEvent) => void`                                                          | -                      |
| onPasteFile  | Callback for pasting files                                                                                        | `(files: FileList) => void`                                                                | -                      |
| onKeyDown    | Callback for keyboard press                                                                                       | `(event: KeyboardEvent) => void \| false`                                                  | -                      |
| onFocus      | Callback for getting focus                                                                                        | `(event: FocusEvent) => void`                                                              | -                      |
| onBlur       | Callback for losing focus                                                                                         | `(event: FocusEvent) => void`                                                              | -                      |
| placeholder  | Placeholder of the input box                                                                                      | `string`                                                                                   | -                      |
| autoSize     | Auto-adjust content height, can be set to true \| false or object: `{ minRows?: number; maxRows?: number }`       | `boolean \| { minRows?: number; maxRows?: number }`                                        | `{ maxRows: 8 }`       |
| slotConfig   | Slot configuration, enables slot mode for structured input. In this mode, `value` and `defaultValue` are invalid  | `SlotConfigType[]`                                                                         | -                      |
| skill        | Skill configuration, enables slot mode for structured input. In this mode, `value` and `defaultValue` are invalid | `SkillType`                                                                                | -                      |

```typescript
interface SkillType {
  title?: VNodeChild;
  value: string;
  toolTip?: {
    title?: VNodeChild;
  };
  closable?:
    | boolean
    | {
        closeIcon?: VNodeChild;
        onClose?: (event: MouseEvent) => void;
        disabled?: boolean;
      };
}
```

```typescript
type SpeechConfig = {
  // When `recording` is set, the built-in voice input feature will be disabled.
  // Developers need to implement third-party voice input functionality.
  recording?: boolean;
  onRecordingChange: (recording: boolean) => void;
};
```

```typescript
type ActionsComponents = {
  SendButton: DefineComponent<ButtonProps>;
  ClearButton: DefineComponent<ButtonProps>;
  LoadingButton: DefineComponent<ButtonProps>;
  SpeechButton: DefineComponent<ButtonProps>;
};
```

### Slots

| Slot Name | Description              | Type                                         |
| --------- | ------------------------ | -------------------------------------------- |
| `header`  | Custom header panel      | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `prefix`  | Custom input prefix area | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `suffix`  | Custom input suffix area | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `footer`  | Custom footer area       | `(info: SenderLayoutSlotInfo) => VNodeChild` |

Render priority: corresponding slot > corresponding prop.

```typescript
type SenderLayoutSlotInfo = {
  defaultNode: VNodeChild;
  components: ActionsComponents;
};
```

### Sender Ref

| Property      | Description                                                                                                        | Type                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| nativeElement | Outer container                                                                                                    | `HTMLDivElement`                                                                       |
| focus         | Get focus. When `cursor = 'slot'`, focus moves to the first slot input node, or falls back to `end` if none exists | `(options?: SenderFocusOptions) => void`                                               |
| blur          | Remove focus                                                                                                       | `() => void`                                                                           |
| insert        | Insert text or slots. Ensure `slotConfig` is configured when inserting slots                                       | `(value: string \| SlotConfigType[], position?: 'start' \| 'end' \| 'cursor') => void` |
| clear         | Clear content                                                                                                      | `() => void`                                                                           |
| getValue      | Get current content and structured configuration                                                                   | `() => { value: string; slotConfig?: SlotConfigType[]; skill?: SkillType }`            |

```typescript
interface SenderFocusOptions extends FocusOptions {
  cursor?: "start" | "end" | "all" | "slot";
  key?: string;
}
```

#### SlotConfigType

| Property     | Description                                                  | Type                                                              |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| type         | Node type, determines the rendering component type, required | `'text' \| 'input' \| 'select' \| 'tag' \| 'content' \| 'custom'` |
| key          | Unique identifier, can be omitted when type is `text`        | `string`                                                          |
| formatResult | Format the final result                                      | `(value: any) => string`                                          |

##### text node properties

| Property | Description  | Type   |
| -------- | ------------ | ------ |
| value    | Text content | string |

##### input node properties

| Property           | Description   | Type                                  |
| ------------------ | ------------- | ------------------------------------- |
| props.placeholder  | Placeholder   | string                                |
| props.defaultValue | Default value | string \| number \| readonly string[] |

##### select node properties

| Property           | Description             | Type     |
| ------------------ | ----------------------- | -------- |
| props.options      | Options array, required | string[] |
| props.placeholder  | Placeholder             | string   |
| props.defaultValue | Default value           | string   |

##### tag node properties

| Property    | Description           | Type         |
| ----------- | --------------------- | ------------ |
| props.label | Tag content, required | `VNodeChild` |
| props.value | Tag value             | string       |

##### content node properties

| Property           | Description   | Type   |
| ------------------ | ------------- | ------ |
| props.defaultValue | Default value | any    |
| props.placeholder  | Placeholder   | string |

##### custom node properties

| Property           | Description               | Type                                                                                                                                  |
| ------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| props.defaultValue | Default value             | any                                                                                                                                   |
| customRender       | Custom rendering function | `(value: any, onChange: (value: any) => void, props: { disabled?: boolean; readOnly?: boolean }, item: SlotConfigType) => VNodeChild` |

### Sender.Header

| Property     | Description                                                                             | Type                                                    | Default |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------- |
| title        | Title                                                                                   | `VNodeChild`                                            | -       |
| open         | Whether to expand                                                                       | `boolean`                                               | `false` |
| closable     | Whether it can be closed                                                                | `boolean`                                               | `true`  |
| forceRender  | Force rendering. Use when you need to reference internal elements during initialization | `boolean`                                               | `false` |
| classNames   | Style class names                                                                       | `Partial<Record<'header' \| 'content', string>>`        | -       |
| styles       | Semantic style definition                                                               | `Partial<Record<'header' \| 'content', CSSProperties>>` | -       |
| onOpenChange | Callback for expansion state change                                                     | `(open: boolean) => void`                               | -       |

#### Sender.Header Slots

| Slot Name | Description          | Type               |
| --------- | -------------------- | ------------------ |
| `title`   | Custom title content | `() => VNodeChild` |
| `default` | Custom content area  | `() => VNodeChild` |

Render priority: corresponding slot > corresponding prop.

### Sender.Switch

| Property          | Description               | Type                                                                       | Default |
| ----------------- | ------------------------- | -------------------------------------------------------------------------- | ------- |
| checkedChildren   | Content when checked      | `VNodeChild`                                                               | -       |
| unCheckedChildren | Content when unchecked    | `VNodeChild`                                                               | -       |
| icon              | Set icon component        | `VNodeChild`                                                               | -       |
| disabled          | Whether disabled          | `boolean`                                                                  | `false` |
| loading           | Loading switch            | `boolean`                                                                  | `false` |
| defaultValue      | Default checked state     | `boolean`                                                                  | `false` |
| value             | Switch value              | `boolean`                                                                  | -       |
| rootClass         | Root element style class  | `string`                                                                   | -       |
| classNames        | Style class names         | `Partial<Record<'root' \| 'content' \| 'icon' \| 'title', string>>`        | -       |
| styles            | Semantic style definition | `Partial<Record<'root' \| 'content' \| 'icon' \| 'title', CSSProperties>>` | -       |
| onChange          | Callback when changed     | `(checked: boolean) => void`                                               | -       |

#### Sender.Switch Slots

| Slot Name           | Description                 | Type               |
| ------------------- | --------------------------- | ------------------ |
| `icon`              | Custom icon content         | `() => VNodeChild` |
| `checkedChildren`   | Custom checked content      | `() => VNodeChild` |
| `unCheckedChildren` | Custom unchecked content    | `() => VNodeChild` |
| `default`           | Additional trailing content | `() => VNodeChild` |

Render priority: `icon` / `checkedChildren` / `unCheckedChildren` corresponding slot > corresponding prop.

### ⚠️ Slot Mode Notes

- **In slot mode, `value` and `defaultValue` are invalid**. Please use `ref` and callback events to get current value and slot configuration.
- **In slot mode, the third argument `slotConfig` in `onChange`/`onSubmit`** is only used to get current structured content.

## Semantic DOM

<demo src="./demo/_semantic.vue" simplify>Sender Semantic DOM</demo>

<demo src="./demo/_semantic-switch.vue" simplify>Sender.Switch Semantic DOM</demo>
