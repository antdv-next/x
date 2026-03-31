---
title: Sender
subtitle: 输入框
description: 用于聊天的输入框组件。
---

## 何时使用

- 需要构建一个对话场景下的输入框

## 代码演示

<demo src="./demo/agent.vue">智能体输入</demo>
<demo src="./demo/basic.vue">基本用法</demo>
<demo src="./demo/switch.vue">功能开关</demo>
<demo src="./demo/slot-filling.vue">词槽模式</demo>
<demo src="./demo/ref-action.vue">实例方法</demo>
<demo src="./demo/submit-type.vue">提交方式</demo>
<demo src="./demo/speech.vue">语音输入</demo>
<demo src="./demo/speech-custom.vue">自定义语音输入</demo>
<demo src="./demo/suffix.vue">自定义后缀</demo>
<demo src="./demo/layout-slots.vue">区域插槽</demo>
<demo src="./demo/disable-ctrl.vue">发送控制</demo>
<demo src="./demo/disable-ctrl-slot.vue">词槽发送控制</demo>
<demo src="./demo/header.vue">展开面板</demo>
<demo src="./demo/header-title-slot.vue">头部标题插槽</demo>
<demo src="./demo/switch-slots.vue">开关插槽</demo>
<demo src="./demo/slot-with-suggestion.vue">快捷指令</demo>
<demo src="./demo/header-fixed.vue">引用</demo>
<demo src="./demo/footer.vue">自定义底部内容</demo>
<demo src="./demo/send-style.vue">调整样式</demo>
<demo src="./demo/paste-image.vue">黏贴文件</demo>
<demo src="./demo/loading.vue">加载状态</demo>

## API

### SenderProps

| 属性         | 说明                                                                                              | 类型                                                                                       | 默认值           |
| ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| allowSpeech  | 是否允许语音输入                                                                                  | `boolean \| SpeechConfig`                                                                  | `false`          |
| classNames   | 样式类名                                                                                          | `Partial<Record<SemanticType, string>>`                                                    | -                |
| defaultValue | 输入框默认值                                                                                      | `string`                                                                                   | -                |
| disabled     | 是否禁用                                                                                          | `boolean`                                                                                  | `false`          |
| loading      | 是否加载中                                                                                        | `boolean`                                                                                  | `false`          |
| suffix       | 后缀内容，默认展示操作按钮，当不需要默认操作按钮时，可以设为 `false`                              | `VNodeChild \| false \| NodeRender`                                                        | 默认操作按钮     |
| header       | 头部面板                                                                                          | `VNodeChild \| false \| NodeRender`                                                        | `false`          |
| prefix       | 前缀内容                                                                                          | `VNodeChild \| false \| NodeRender`                                                        | `false`          |
| footer       | 底部内容                                                                                          | `VNodeChild \| false \| NodeRender`                                                        | `false`          |
| readOnly     | 是否让输入框只读                                                                                  | `boolean`                                                                                  | `false`          |
| rootClass    | 根元素样式类                                                                                      | `string`                                                                                   | -                |
| styles       | 语义化定义样式                                                                                    | `Partial<Record<SemanticType, CSSProperties>>`                                             | -                |
| submitType   | 提交模式                                                                                          | `'enter' \| 'shiftEnter'`                                                                  | `'enter'`        |
| value        | 输入框值                                                                                          | `string`                                                                                   | -                |
| onSubmit     | 点击发送按钮的回调                                                                                | `(message: string, slotConfig?: SlotConfigType[], skill?: SkillType) => void`              | -                |
| onChange     | 输入框值改变的回调                                                                                | `(value: string, event?: Event, slotConfig?: SlotConfigType[], skill?: SkillType) => void` | -                |
| onCancel     | 点击取消按钮的回调                                                                                | `() => void`                                                                               | -                |
| onPaste      | 粘贴回调                                                                                          | `(event: ClipboardEvent) => void`                                                          | -                |
| onPasteFile  | 黏贴文件的回调                                                                                    | `(files: FileList) => void`                                                                | -                |
| onKeyDown    | 键盘按下回调                                                                                      | `(event: KeyboardEvent) => void \| false`                                                  | -                |
| onFocus      | 获取焦点回调                                                                                      | `(event: FocusEvent) => void`                                                              | -                |
| onBlur       | 失去焦点回调                                                                                      | `(event: FocusEvent) => void`                                                              | -                |
| placeholder  | 输入框占位符                                                                                      | `string`                                                                                   | -                |
| autoSize     | 自适应内容高度，可设置为 true \| false 或对象：`{ minRows?: number; maxRows?: number }`           | `boolean \| { minRows?: number; maxRows?: number }`                                        | `{ maxRows: 8 }` |
| slotConfig   | 词槽配置，配置后输入框将变为词槽模式，支持结构化输入，此模式 `value` 和 `defaultValue` 配置将无效 | `SlotConfigType[]`                                                                         | -                |
| skill        | 技能配置，输入框将变为词槽模式，支持结构化输入，此模式 `value` 和 `defaultValue` 配置将无效       | `SkillType`                                                                                | -                |

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
  // 当设置 `recording` 时，内置的语音输入功能将会被禁用。
  // 交由开发者实现三方语音输入的功能。
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

| 插槽名   | 说明                 | 类型                                         |
| -------- | -------------------- | -------------------------------------------- |
| `header` | 自定义头部面板       | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `prefix` | 自定义输入框前缀区域 | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `suffix` | 自定义输入框后缀区域 | `(info: SenderLayoutSlotInfo) => VNodeChild` |
| `footer` | 自定义底部区域       | `(info: SenderLayoutSlotInfo) => VNodeChild` |

插槽渲染优先级：对应插槽 > 对应 prop。

```typescript
type SenderLayoutSlotInfo = {
  defaultNode: VNodeChild;
  components: ActionsComponents;
};
```

### Sender Ref

| 属性          | 说明                                                                                                               | 类型                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| nativeElement | 外层容器                                                                                                           | `HTMLDivElement`                                                                       |
| focus         | 获取焦点，当 `cursor = 'slot'` 时焦点会在第一个插槽类型为 `input` 的输入框内，若不存在对应 `input` 则与 `end` 一致 | `(options?: SenderFocusOptions) => void`                                               |
| blur          | 取消焦点                                                                                                           | `() => void`                                                                           |
| insert        | 插入文本或者插槽，使用插槽时需确保 `slotConfig` 已配置                                                             | `(value: string \| SlotConfigType[], position?: 'start' \| 'end' \| 'cursor') => void` |
| clear         | 清空内容                                                                                                           | `() => void`                                                                           |
| getValue      | 获取当前内容和结构化配置                                                                                           | `() => { value: string; slotConfig?: SlotConfigType[]; skill?: SkillType }`            |

```typescript
interface SenderFocusOptions extends FocusOptions {
  cursor?: "start" | "end" | "all" | "slot";
  key?: string;
}
```

#### SlotConfigType

| 属性         | 说明                              | 类型                                                              |
| ------------ | --------------------------------- | ----------------------------------------------------------------- |
| type         | 节点类型，决定渲染组件类型，必填  | `'text' \| 'input' \| 'select' \| 'tag' \| 'content' \| 'custom'` |
| key          | 唯一标识，type 为 `text` 时可省略 | `string`                                                          |
| formatResult | 格式化最终结果                    | `(value: any) => string`                                          |

##### text 节点属性

| 属性  | 说明     | 类型   |
| ----- | -------- | ------ |
| value | 文本内容 | string |

##### input 节点属性

| 属性               | 说明   | 类型                                  |
| ------------------ | ------ | ------------------------------------- |
| props.placeholder  | 占位符 | string                                |
| props.defaultValue | 默认值 | string \| number \| readonly string[] |

##### select 节点属性

| 属性               | 说明           | 类型     |
| ------------------ | -------------- | -------- |
| props.options      | 选项数组，必填 | string[] |
| props.placeholder  | 占位符         | string   |
| props.defaultValue | 默认值         | string   |

##### tag 节点属性

| 属性        | 说明           | 类型         |
| ----------- | -------------- | ------------ |
| props.label | 标签内容，必填 | `VNodeChild` |
| props.value | 标签值         | string       |

##### content 节点属性

| 属性               | 说明   | 类型   |
| ------------------ | ------ | ------ |
| props.defaultValue | 默认值 | any    |
| props.placeholder  | 占位符 | string |

##### custom 节点属性

| 属性               | 说明           | 类型                                                                                                                                  |
| ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| props.defaultValue | 默认值         | any                                                                                                                                   |
| customRender       | 自定义渲染函数 | `(value: any, onChange: (value: any) => void, props: { disabled?: boolean; readOnly?: boolean }, item: SlotConfigType) => VNodeChild` |

### Sender.Header

| 属性         | 说明                                        | 类型                                                    | 默认值  |
| ------------ | ------------------------------------------- | ------------------------------------------------------- | ------- |
| title        | 标题                                        | `VNodeChild`                                            | -       |
| open         | 是否展开                                    | `boolean`                                               | `false` |
| closable     | 是否可关闭                                  | `boolean`                                               | `true`  |
| forceRender  | 强制渲染，在初始化便需要 ref 内部元素时使用 | `boolean`                                               | `false` |
| classNames   | 样式类名                                    | `Partial<Record<'header' \| 'content', string>>`        | -       |
| styles       | 语义化定义样式                              | `Partial<Record<'header' \| 'content', CSSProperties>>` | -       |
| onOpenChange | 展开状态改变的回调                          | `(open: boolean) => void`                               | -       |

#### Sender.Header Slots

| 插槽名    | 说明         | 类型               |
| --------- | ------------ | ------------------ |
| `title`   | 自定义标题   | `() => VNodeChild` |
| `default` | 自定义内容区 | `() => VNodeChild` |

插槽渲染优先级：对应插槽 > 对应 prop。

### Sender.Switch

| 属性              | 说明             | 类型                                                                       | 默认值  |
| ----------------- | ---------------- | -------------------------------------------------------------------------- | ------- |
| checkedChildren   | 选中时的内容     | `VNodeChild`                                                               | -       |
| unCheckedChildren | 非选中时的内容   | `VNodeChild`                                                               | -       |
| icon              | 设置图标组件     | `VNodeChild`                                                               | -       |
| disabled          | 是否禁用         | `boolean`                                                                  | `false` |
| loading           | 加载中的开关     | `boolean`                                                                  | `false` |
| defaultValue      | 默认选中状态     | `boolean`                                                                  | `false` |
| value             | 开关的值         | `boolean`                                                                  | -       |
| rootClass         | 根元素样式类     | `string`                                                                   | -       |
| classNames        | 样式类名         | `Partial<Record<'root' \| 'content' \| 'icon' \| 'title', string>>`        | -       |
| styles            | 语义化定义样式   | `Partial<Record<'root' \| 'content' \| 'icon' \| 'title', CSSProperties>>` | -       |
| onChange          | 变化时的回调函数 | `(checked: boolean) => void`                                               | -       |

#### Sender.Switch Slots

| 插槽名              | 说明             | 类型               |
| ------------------- | ---------------- | ------------------ |
| `icon`              | 自定义图标       | `() => VNodeChild` |
| `checkedChildren`   | 自定义选中内容   | `() => VNodeChild` |
| `unCheckedChildren` | 自定义未选中内容 | `() => VNodeChild` |
| `default`           | 追加内容         | `() => VNodeChild` |

插槽渲染优先级：`icon` / `checkedChildren` / `unCheckedChildren` 对应插槽 > 对应 prop。

### ⚠️ 词槽模式注意事项

- **词槽模式下，`value` 和 `defaultValue` 属性无效**，请使用 `ref` 及回调事件获取输入框的值和词槽配置。
- **词槽模式下，`onChange`/`onSubmit` 回调的第三个参数 `slotConfig`**，仅用于获取当前结构化内容。

## 语义化 DOM

<demo src="./demo/_semantic.vue" simplify>Sender 语义结构</demo>

<demo src="./demo/_semantic-switch.vue" simplify>Sender.Switch 语义结构</demo>
