---
title: Questionnaire
description: Collect structured human answers one question at a time and keep a receipt in the conversation.
order: 5
packageName: x-pro
---

## When To Use {#when-to-use}

Use a serializable questionnaire when an agent needs scope, constraints, or a choice between approaches. It provides required-answer gates, selection limits, draft recovery and replayable receipts.

## Examples {#examples}

<demo src="./demo/basic.vue">Single choice and multiple steps</demo>
<demo src="./demo/multiple.vue">Multiple choice, custom input and drafts</demo>
<demo src="./demo/recovery.vue">Errors and idempotent retries</demo>
<demo src="./demo/states.vue">Receipts, expiration and cancellation</demo>
<demo src="./demo/semantic.vue">Semantic styling</demo>

## Integration {#integration}

The component emits structured data; the host sends requests and stores `payload`, `answers` and `status` with the message. Render a text bubble from those answers in the host if history search or copying requires one.

Submission locks answers and navigation immediately. Set `status` to `submitted` after acknowledgement or `error` after failure. Treat HTTP 409 as success and pass a localized explanation through `result`. No network requests happen inside the component.

Retry emits `retry` followed by `submit` with the original submission, including its `submissionId` and `submittedAt`. Send requests **only from the submit listener**; use retry for telemetry. Editing answers creates a new submission intent. Answers survive failures.

A stale `pending` prop cannot reopen a submitted receipt. With `allowRevision`, the user can return to editing while preserving answers. `reset()` clears them. The host should disable revision once the agent consumes the answers. Change `id` or increment `revision` for a new questionnaire.

## Answer Semantics {#validation}

- Questions are required by default. A selected value or non-whitespace custom text counts as an answer. For text-only questions, omit options and set `allowCustom: true`.
- Single-choice custom text clears selected values; multiple-choice custom text coexists and counts as one choice toward min/max limits. Composition input cannot submit and is not trimmed; submitted text preserves whitespace.
- Multiple-choice bounds apply even to optional questions. Use `minSelections: 0` when an optional question may be left empty. Unselected choices are disabled at the maximum; selected choices can be removed.
- Submission checks every question and focuses the first visible error. The last question never submits automatically. Single-choice selection advances after 240ms unless `autoAdvance: false`; manual navigation or custom input focus cancels the timer.
- `skipped` records explicit Skip question actions only. Skipping the entire questionnaire emits `skip` and enters cancelled state.
- `validateQuestionnaire(unknown)` validates wire data. Invalid envelopes render an inline placeholder; invalid questions affect their own view and block submission. Empty sets render nothing and warn. Payload content is rendered as plain text.

## Drafts And Expiration {#drafts}

`draftKey` enables optional localStorage persistence for 24 hours, including answers, step and explicit skips. Storage failures and SSR do not block rendering. Drafts must match the payload id and revision. Precedence: server terminal status, controlled answers/step, explicit defaults, then draft. Submission acknowledgement, cancellation, expiry and reset clear the draft. The host persists submissions; local drafts do not provide idempotency across refreshes. Use a unique key per message and decide whether local persistence suits the answers being collected.

`expiresAt` makes the questionnaire read-only at its deadline while preserving answers. Server `expired` and `cancelled` states also display receipts. Those states cannot be reset; start a new revision.

## API {#api}

### Props {#properties}

Properties marked ✓ can be configured globally through `XProProvider`.

| Prop           | Description                                   | Type                          | Default     | Version | Global Config |
| -------------- | --------------------------------------------- | ----------------------------- | ----------- | ------- | ------------- |
| payload        | Required serializable question set            | `QuestionnairePayload`        | —           | -       | ×             |
| status         | Host lifecycle state                          | `QuestionnaireStatus`         | `'pending'` | -       | ×             |
| answers        | Controlled answers; `v-model:answers`         | `QuestionnaireAnswers`        | —           | -       | ×             |
| defaultAnswers | Initial uncontrolled answers                  | `QuestionnaireAnswers`        | `{}`        | -       | ×             |
| step           | Controlled, clamped index; `v-model:step`     | `number`                      | —           | -       | ×             |
| defaultStep    | Initial uncontrolled index                    | `number`                      | `0`         | -       | ×             |
| result         | Receipt summary                               | `string`                      | —           | -       | ×             |
| error          | Submission failure message                    | `string`                      | locale      | -       | ×             |
| allowRevision  | Allow editing a submitted questionnaire       | `boolean`                     | `false`     | -       | ✓             |
| draftKey       | Optional localStorage key                     | `string`                      | —           | -       | ×             |
| disabled       | Read-only rendering                           | `boolean`                     | `false`     | -       | ✓             |
| dismissible    | Show a dismiss action; host removes the panel | `boolean`                     | `false`     | -       | ✓             |
| prefixCls      | Style prefix                                  | `string`                      | —           | -       | ×             |
| rootClass      | Root class hook                               | `string`                      | —           | -       | ×             |
| classes        | Semantic classes, object or function          | `QuestionnaireClassNamesType` | —           | -       | ✓             |
| styles         | Semantic styles, object or function           | `QuestionnaireStylesType`     | —           | -       | ✓             |

`allowRevision`, `disabled`, `dismissible`, `classes` and `styles` accept package defaults through `XProProvider.questionnaire`. Instance props take precedence. Payloads, answers, draft keys and lifecycle status remain instance data.

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

### Events {#events}

| Event          | Payload                                       | Description                            | Version |
| -------------- | --------------------------------------------- | -------------------------------------- | ------- |
| update:answers | `QuestionnaireAnswers`                        | Answer change                          | -       |
| update:step    | `number`                                      | Step change                            | -       |
| submit         | `QuestionnaireSubmission`                     | Valid submission, including retries    | -       |
| retry          | None                                          | Retry notification, followed by submit | -       |
| skip           | `{ questionSetId: string, revision: number }` | Skip the entire set                    | -       |
| dismiss        | None                                          | Host-owned dismissal                   | -       |

### Slots {#slots}

Every slot receives `{ answers, step, status }`. `questionExtra` also receives `question`; `footer` also receives `submit()` and `goToStep(step)`.

| Slot          | Description                                                                         | Type                                                                                               | Version |
| ------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| questionExtra | Additional content after the current question                                       | `(info: QuestionnaireSlotProps & { question: QuestionnaireQuestion }) => any`                      | -       |
| receipt       | Replace the answer list, retaining the receipt heading, result and revision action  | `(info: QuestionnaireSlotProps) => any`                                                            | -       |
| footer        | Replace actions; implement disabled and accessibility semantics for custom controls | `(info: QuestionnaireSlotProps & { submit: () => void; goToStep: (step: number) => void }) => any` | -       |

### Methods {#methods}

| Member         | Description                                                                                       | Type                     | Version |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| submit()       | Validate and submit; no-op while locked or composing                                              | `() => void`             | -       |
| goToStep(step) | Clamp and navigate; no-op while locked                                                            | `(step: number) => void` | -       |
| reset()        | Clear answers and return to pending; only submitted with allowRevision can reset a terminal state | `() => void`             | -       |
| nativeElement  | Component root element                                                                            | `HTMLElement \| null`    | -       |

## Semantic DOM {#semantic-dom}

<demo src="./demo/_semantic.vue" simplify></demo>

Semantic nodes: `root`, `header`, `title`, `progress`, `content`, `question`, `description`, `options`, `option`, `custom`, `error`, `footer`, `receipt`, `chip`.

## Design Token {#design-token}

<ComponentTokenTable component="Questionnaire" provider="XProProvider"></ComponentTokenTable>

See [Customize Theme](https://www.antdv-next.com/docs/vue/customize-theme) to learn how to use Design Token. Configure component tokens through `XProProvider.theme.components.Questionnaire` and global tokens through `theme.token`. For per-instance styling, see the [semantic styling example](#questionnaire-demo-semantic).

`motionDuration` excludes the 240ms auto-advance delay and question fade-in duration. At viewport widths of 480px or less, panel padding uses the global `padding` token.

## Accessibility {#accessibility}

The default interface uses native radios, checkboxes, textareas and buttons to preserve browser keyboard behavior. Selection is indicated by a control marker, border and background; required questions also have a visible text marker.

### Keyboard {#keyboard}

| Key                   | Behavior                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `Tab` / `Shift + Tab` | Move focus between option groups, inputs and available action buttons    |
| Arrow keys            | Move and select within a radio group; the browser skips disabled options |
| `Space`               | Select the focused radio or toggle the focused checkbox                  |
| `Enter` / `Space`     | Activate a focused action button, such as Previous, Next or Submit       |
| `Enter` in a textarea | Insert a line break without implicitly submitting the questionnaire      |

Single-choice selections advance after 240ms by default; the final question always requires explicit submission. Set `autoAdvance: false` when users should confirm navigation themselves. Focusing the custom input cancels pending automatic navigation, and submission is suppressed during IME composition.

### Focus And Announcements {#focus-and-announcements}

| Scenario                        | Default behavior                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Question changes                | Focus moves to the question heading; `aria-live="polite"` announces the step                                    |
| Submission validation fails     | Navigate to the first invalid question and focus its visible error                                              |
| Host sets `error`               | Focus the failure message, announce it with `role="alert"`, and preserve answers                                |
| Submitted, expired or cancelled | Focus moves to the receipt heading; the receipt uses `role="status"`                                            |
| Submitting                      | Built-in controls are disabled, the interaction area has `aria-busy`, and answer/navigation actions are ignored |
| Collapsing                      | The interaction area becomes `inert` and `aria-hidden` immediately, then unmounts after the transition          |

Option names use `aria-labelledby`; descriptions use `aria-describedby` so supplementary text stays separate from the name. Custom inputs have associated labels and announce the character count and limit when approaching the maximum length.

### Motion And Custom Content {#accessible-customization}

With `prefers-reduced-motion: reduce`, question changes and disclosure use short fades, and progress dots stop transitioning. Textareas retain a visible focus outline in forced-colors mode.

When using slots or overriding styles, preserve these conventions:

- `footer`: use native buttons, disable actions according to the slot's `status` and the instance's `disabled` prop, and give icon-only buttons accessible names.
- `questionExtra`: provide alternative text for images and labels for additional inputs; avoid stealing focus from the question heading.
- `receipt`: keep answers associated with their questions and show unanswered states explicitly; the component retains the outer receipt region and heading.
- `classes` / `styles`: retain visible keyboard focus, readable contrast and selection markers; use more than color to convey state. Default action targets are at least 36×36px; avoid shrinking them when overriding styles.
