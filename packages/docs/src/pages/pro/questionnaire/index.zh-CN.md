---
title: Questionnaire
subtitle: 问卷回复面板
description: Agent 发问，用户逐题作答，提交结构化答案后原地保留回执。
order: 5
packageName: x-pro
---

## 何时使用 {#when-to-use}

Agent 需要确认范围、收集约束或让用户选择方案时，使用可序列化的问卷代替自由文本提问。单题聚焦，提供必答校验、多选数量限制、草稿恢复和可重放的回执。

## 代码演示 {#examples}

<demo src="./demo/basic.vue">单选与多步</demo>
<demo src="./demo/multiple.vue">多选、自定义输入与草稿</demo>
<demo src="./demo/recovery.vue">失败与幂等重试</demo>
<demo src="./demo/states.vue">历史回执、过期与取消</demo>
<demo src="./demo/semantic.vue">语义化样式</demo>

## 宿主接入 {#integration}

组件只负责数据收集，不发请求、不生成聊天气泡。宿主在 `submit` 中发起请求，将答案和终态一起保存到消息记录；刷新时用 `payload`、`answers`、`status` 重放。需要历史搜索或复制时，由宿主从结构化答案生成文本气泡。

点击提交后立即锁定答案和题号，等待宿主更新 `status`。成功设为 `submitted`，失败设为 `error`；失败保留答案。每次重试会依次触发 `retry` 和携带原始 payload 的 `submit`，复用原 `submissionId` 和 `submittedAt`。**仅在 `submit` 监听器发请求**，`retry` 用于埋点。修改答案后再次提交会生成新幂等键。

```ts
async function onSubmit(submission: QuestionnaireSubmission) {
  status.value = "submitting";
  try {
    const response = await fetch("/api/questionnaires", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": submission.submissionId,
      },
      body: JSON.stringify(submission),
    });
    if (response.ok || response.status === 409) {
      result.value =
        response.status === 409 ? "该问卷已在其他设备提交" : "答案已收到";
      status.value = "submitted";
    } else {
      status.value = "error";
    }
  } catch {
    status.value = "error";
  }
}
```

`submitted` 不会因传入旧的 `pending` 无声回退。开启 `allowRevision` 后，用户可以点击修改按钮保留答案并重新编辑；`reset()` 清空答案。宿主应在 Agent 消费答案后关闭 `allowRevision`。新的 `id` 或 `revision` 开启独立问卷；内容更新时应递增 `revision`。

## 答案与校验 {#validation}

- `required` 默认 `true`，选中选项或非空白自定义文本才算回答。纯输入题用 `options` 留空且 `allowCustom: true` 表达。
- 单选自定义文本与选项互斥；多选时两者共存，自定义非空白文本计为一项，参与上下限校验。组合输入期间不提交、不 trim，回传保留用户输入的空格。
- `minSelections` 和 `maxSelections` 是多选题的数量约束，即使 `required: false` 也生效。需要可完全跳过的题目时，将 `minSelections` 设为 `0`。到达上限后禁用未选项；可撤销已选项。
- 点击提交时校验整卷，定位第一道未通过的题目并显示原因。末题从不自动提交。单选默认在 240ms 后前进，手动换题或聚焦输入框会取消。
- `skipped` 仅记录用户点击“跳过此题”的题目；未操作的可选题不会被推断为显式跳过。整卷跳过触发 `skip` 并进入取消态。
- 运行时 `validateQuestionnaire(unknown)` 校验配置。非法问卷显示行内占位；非法题目只影响该题，同时阻止整卷提交；空题目列表不渲染并告警。所有 payload 文案按纯文本渲染。

## 草稿与过期 {#drafts}

设置 `draftKey` 后，组件可选使用 localStorage 保存答案、题号和显式跳过记录，TTL 为 24 小时；浏览器禁用存储或 SSR 时静默跳过。草稿必须匹配 `id` 和 `revision`。优先级为：服务端终态 > 受控 `answers` / `step` > 显式 `defaultAnswers` / `defaultStep` > 草稿。成功、取消、过期和重置都会清除草稿。提交记录应由宿主保存，localStorage 只恢复未提交草稿，不承担跨刷新幂等。

`expiresAt` 到点自动只读并保留答案；服务端的 `expired`、`cancelled` 同样显示回执。过期与取消无法通过 `reset()` 重开，需要新 revision。问卷内容可能包含敏感答案，请由应用决定是否启用草稿，并使用每条消息独有的 key。

## API {#api}

### 属性 {#properties}

标注 ✓ 的属性支持通过 `XProProvider` 全局配置。

| 属性           | 说明                                    | 类型                          | 默认值      | 版本 | 全局配置 |
| -------------- | --------------------------------------- | ----------------------------- | ----------- | ---- | -------- |
| payload        | 必填，可 JSON 序列化的问卷              | `QuestionnairePayload`        | —           | -    | ×        |
| status         | 宿主生命周期状态                        | `QuestionnaireStatus`         | `'pending'` | -    | ×        |
| answers        | 受控答案，支持 `v-model:answers`        | `QuestionnaireAnswers`        | —           | -    | ×        |
| defaultAnswers | 非受控初始答案                          | `QuestionnaireAnswers`        | `{}`        | -    | ×        |
| step           | 受控题号，支持 `v-model:step`，自动钳制 | `number`                      | —           | -    | ×        |
| defaultStep    | 非受控初始题号                          | `number`                      | `0`         | -    | ×        |
| result         | 回执摘要                                | `string`                      | —           | -    | ×        |
| error          | 提交失败文案                            | `string`                      | locale      | -    | ×        |
| allowRevision  | 允许用户从已提交回执返回修改            | `boolean`                     | `false`     | -    | ✓        |
| draftKey       | localStorage 草稿 key                   | `string`                      | —           | -    | ×        |
| disabled       | 只读模式                                | `boolean`                     | `false`     | -    | ✓        |
| dismissible    | 显示关闭按钮，触发 dismiss，由宿主移除  | `boolean`                     | `false`     | -    | ✓        |
| prefixCls      | 样式前缀                                | `string`                      | —           | -    | ×        |
| rootClass      | 根节点类名                              | `string`                      | —           | -    | ×        |
| classes        | 语义化类名，对象或函数                  | `QuestionnaireClassNamesType` | —           | -    | ✓        |
| styles         | 语义化行内样式，对象或函数              | `QuestionnaireStylesType`     | —           | -    | ✓        |

`allowRevision`、`disabled`、`dismissible`、`classes`、`styles` 支持 `XProProvider` 的 `questionnaire` 全局配置。单实例 props 优先。全局不保存 payload、答案、草稿 key 和生命周期状态。

### QuestionnairePayload {#questionnaire-payload}

```ts
interface QuestionnairePayload {
  id: string;
  revision: number;
  title?: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  submitLabel?: string;
  allowSkip?: boolean;
  expiresAt?: string; // ISO 8601
}
interface QuestionnaireQuestion {
  id: string;
  title: string;
  description?: string;
  type: "single" | "multiple";
  required?: boolean; // true
  options?: QuestionnaireOption[];
  minSelections?: number; // 0
  maxSelections?: number; // unlimited
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  customMaxLength?: number; // 500
  autoAdvance?: boolean; // true, single only
}
interface QuestionnaireOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
interface QuestionnaireAnswer {
  selected: string[];
  custom?: string;
}
type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;
interface QuestionnaireSubmission {
  questionSetId: string;
  revision: number;
  answers: QuestionnaireAnswers;
  skipped: string[];
  submissionId: string;
  submittedAt: string;
}
type QuestionnaireStatus =
  "pending" | "submitting" | "submitted" | "expired" | "error" | "cancelled";
```

### 事件 {#events}

| 事件           | 载荷                                          | 说明                      | 版本 |
| -------------- | --------------------------------------------- | ------------------------- | ---- |
| update:answers | `QuestionnaireAnswers`                        | 答案变化                  | -    |
| update:step    | `number`                                      | 题号变化                  | -    |
| submit         | `QuestionnaireSubmission`                     | 校验通过的提交，含重试    | -    |
| retry          | 无                                            | 重试通知，随后触发 submit | -    |
| skip           | `{ questionSetId: string, revision: number }` | 整卷跳过                  | -    |
| dismiss        | 无                                            | 点击关闭，由宿主处理      | -    |

### 插槽 {#slots}

所有插槽收到 `{ answers, step, status }`。`questionExtra` 额外收到 `question`，`footer` 额外收到 `submit()` 和 `goToStep(step)`。

| 插槽          | 说明                                                 | 类型                                                                                               | 版本 |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| questionExtra | 当前题目后方的自定义内容                             | `(info: QuestionnaireSlotProps & { question: QuestionnaireQuestion }) => any`                      | -    |
| receipt       | 替换逐题答案列表，保留回执标题、摘要及修改按钮       | `(info: QuestionnaireSlotProps) => any`                                                            | -    |
| footer        | 替换操作区，需由宿主为自定义控件实现禁用和无障碍语义 | `(info: QuestionnaireSlotProps & { submit: () => void; goToStep: (step: number) => void }) => any` | -    |

### 方法 {#methods}

| 方法           | 说明                                                             | 类型                     | 版本 |
| -------------- | ---------------------------------------------------------------- | ------------------------ | ---- |
| submit()       | 校验并提交；锁定或输入法组合期 no-op                             | `() => void`             | -    |
| goToStep(step) | 钳制并切换题号；锁定时 no-op                                     | `(step: number) => void` | -    |
| reset()        | 清空答案并回到 pending；终态仅 allowRevision 的 submitted 可重置 | `() => void`             | -    |
| nativeElement  | 组件根元素                                                       | `HTMLElement \| null`    | -    |

## 语义化 DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>

语义节点：`root`、`header`、`title`、`progress`、`content`、`question`、`description`、`options`、`option`、`custom`、`error`、`footer`、`receipt`、`chip`。

## 主题变量（Design Token） {#design-token}

<ComponentTokenTable component="Questionnaire" provider="XProProvider"></ComponentTokenTable>

查看 [定制主题](https://www.antdv-next.com/docs/vue/customize-theme-cn) 了解如何使用主题变量。Questionnaire 通过 `XProProvider` 的 `theme.components.Questionnaire` 配置组件 Token，通过 `theme.token` 配置全局 Token。单个实例的样式调整参见[语义化样式示例](#questionnaire-demo-semantic)。

`motionDuration` 不影响单选自动前进的 240ms 等待时间和换题淡入时长；`panelPadding` 在窄屏（≤480px）下使用全局 `padding` token。

## 无障碍 {#accessibility}

默认界面使用原生 radio、checkbox、textarea 和 button，保留浏览器的键盘行为。选中状态同时通过选择标记、边框和背景表达；必答题也有可见文字标记。

### 键盘操作 {#keyboard}

| 按键                  | 行为                                           |
| --------------------- | ---------------------------------------------- |
| `Tab` / `Shift + Tab` | 在选项组、输入框和可用操作按钮之间移动焦点     |
| 方向键                | 在同组单选项之间移动并选择，禁用项由浏览器跳过 |
| `Space`               | 选择当前单选项，或切换当前多选项               |
| `Enter` / `Space`     | 激活已聚焦的上一题、下一题、提交等按钮         |
| 输入框内的 `Enter`    | 输入换行，不会隐式提交整份问卷                 |

单选默认在选择后等待 240ms 自动前进，末题始终需要显式提交。需要用户自行确认换题时，可设置 `autoAdvance: false`。聚焦自定义输入框会取消待执行的自动前进；输入法组合期间不会提交。

### 焦点与读屏反馈 {#focus-and-announcements}

| 场景               | 默认行为                                                 |
| ------------------ | -------------------------------------------------------- |
| 换题               | 焦点落在当前题目标题，题号通过 `aria-live="polite"` 播报 |
| 提交校验失败       | 回到第一道未通过的题目，聚焦可见的错误信息               |
| 宿主更新为 `error` | 聚焦失败信息，通过 `role="alert"` 播报，保留答案         |
| 提交、过期或取消   | 焦点落在回执标题，回执区域使用 `role="status"`           |
| 提交中             | 禁用内置控件，交互区设置 `aria-busy`，忽略答案与题号操作 |
| 折叠退出           | 交互区立即设置 `inert` 和 `aria-hidden`，动画结束后卸载  |

选项名称通过 `aria-labelledby` 关联，补充说明通过 `aria-describedby` 关联，避免把说明混入选项名称。自定义输入提供关联标签，接近字数上限时播报计数与上限提示。

### 动效与自定义内容 {#accessible-customization}

开启 `prefers-reduced-motion: reduce` 时，换题和折叠使用短暂淡入淡出，进度点取消过渡。输入框在强制颜色模式下保留可见的焦点轮廓。

使用插槽或覆盖样式时，请保留以下约定：

- `footer`：使用原生按钮，按插槽提供的 `status` 和实例的 `disabled` 禁用操作；为图标按钮提供可访问名称。
- `questionExtra`：为图片提供替代文本，为新增输入提供标签；避免自动抢占题目焦点。
- `receipt`：保持答案与题目之间的关联，明确显示未回答状态；组件会保留外层回执区域和标题。
- `classes` / `styles`：保留键盘焦点提示、文本对比度和选择标记，避免仅用颜色表达状态；默认操作目标至少为 36×36px，覆盖样式时不要缩小。
