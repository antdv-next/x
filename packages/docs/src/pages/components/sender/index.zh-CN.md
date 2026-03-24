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
<demo src="./demo/disable-ctrl.vue">发送控制</demo>
<demo src="./demo/disable-ctrl-slot.vue">词槽发送控制</demo>
<demo src="./demo/header.vue">展开面板</demo>
<demo src="./demo/slot-with-suggestion.vue">快捷指令</demo>
<demo src="./demo/header-fixed.vue">引用</demo>
<demo src="./demo/footer.vue">自定义底部内容</demo>
<demo src="./demo/send-style.vue">调整样式</demo>
<demo src="./demo/paste-image.vue">黏贴文件</demo>
<demo src="./demo/loading.vue">加载状态</demo>

## API

### SenderProps

| 属性         | 说明               | 类型                                                | 默认值           |
| ------------ | ------------------ | --------------------------------------------------- | ---------------- |
| allowSpeech  | 是否允许语音输入   | `boolean \| SpeechConfig`                           | `false`          |
| classNames   | 样式类名           | `Partial<Record<SemanticType, string>>`             | -                |
| defaultValue | 输入框默认值       | `string`                                            | -                |
| disabled     | 是否禁用           | `boolean`                                           | `false`          |
| loading      | 是否加载中         | `boolean`                                           | `false`          |
| suffix       | 后缀内容           | `VNodeChild \| false \| NodeRender`                 | 默认操作按钮     |
| header       | 头部面板           | `VNodeChild \| false \| NodeRender`                 | `false`          |
| prefix       | 前缀内容           | `VNodeChild \| false \| NodeRender`                 | `false`          |
| footer       | 底部内容           | `VNodeChild \| false \| NodeRender`                 | `false`          |
| readOnly     | 是否让输入框只读   | `boolean`                                           | `false`          |
| rootClass    | 根元素样式类       | `string`                                            | -                |
| styles       | 语义化定义样式     | `Partial<Record<SemanticType, CSSProperties>>`      | -                |
| submitType   | 提交模式           | `'enter' \| 'shiftEnter'`                           | `'enter'`        |
| value        | 输入框值           | `string`                                            | -                |
| placeholder  | 输入框占位符       | `string`                                            | -                |
| autoSize     | 自适应内容高度     | `boolean \| { minRows?: number; maxRows?: number }` | `{ maxRows: 8 }` |
| onSubmit     | 点击发送按钮的回调 | `(message: string) => void`                         | -                |
| onChange     | 输入框值改变的回调 | `(value: string, event?: Event) => void`            | -                |
| onCancel     | 点击取消按钮的回调 | `() => void`                                        | -                |
| onPaste      | 粘贴回调           | `(event: ClipboardEvent) => void`                   | -                |
| onPasteFile  | 黏贴文件的回调     | `(files: FileList) => void`                         | -                |
| onKeyDown    | 键盘按下回调       | `(event: KeyboardEvent) => void \| false`           | -                |
| onFocus      | 获取焦点回调       | `(event: FocusEvent) => void`                       | -                |
| onBlur       | 失去焦点回调       | `(event: FocusEvent) => void`                       | -                |

```typescript
type SpeechConfig = {
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

### Sender Ref

| 属性          | 说明     | 类型                                                              |
| ------------- | -------- | ----------------------------------------------------------------- |
| nativeElement | 外层容器 | `HTMLDivElement`                                                  |
| focus         | 获取焦点 | `(options?: FocusOptions) => void`                                |
| blur          | 取消焦点 | `() => void`                                                      |
| clear         | 清空内容 | `() => void`                                                      |
| insert        | 插入文本 | `(text: string, position?: 'start' \| 'end' \| 'cursor') => void` |

### Sender.Header

| 属性         | 说明               | 类型                                                    | 默认值  |
| ------------ | ------------------ | ------------------------------------------------------- | ------- |
| title        | 标题               | `VNodeChild`                                            | -       |
| open         | 是否展开           | `boolean`                                               | `false` |
| closable     | 是否可关闭         | `boolean`                                               | `true`  |
| classNames   | 样式类名           | `Partial<Record<'header' \| 'content', string>>`        | -       |
| styles       | 语义化定义样式     | `Partial<Record<'header' \| 'content', CSSProperties>>` | -       |
| onOpenChange | 展开状态改变的回调 | `(open: boolean) => void`                               | -       |

### Sender.Switch

| 属性              | 说明             | 类型                         | 默认值  |
| ----------------- | ---------------- | ---------------------------- | ------- |
| checkedChildren   | 选中时的内容     | `VNodeChild`                 | -       |
| unCheckedChildren | 非选中时的内容   | `VNodeChild`                 | -       |
| icon              | 设置图标组件     | `VNodeChild`                 | -       |
| disabled          | 是否禁用         | `boolean`                    | `false` |
| loading           | 加载中的开关     | `boolean`                    | `false` |
| defaultValue      | 默认选中状态     | `boolean`                    | `false` |
| value             | 开关的值         | `boolean`                    | -       |
| onChange          | 变化时的回调函数 | `(checked: boolean) => void` | -       |
| rootClass         | 根元素样式类     | `string`                     | -       |
