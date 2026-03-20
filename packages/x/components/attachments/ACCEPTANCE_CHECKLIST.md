# Attachments Migration Acceptance Checklist

Reference: `/Users/carl-chen/Desktop/oss/x/packages/x/components/attachments`

## Demo Alignment

- [x] `basic.vue`: trigger-button upload + `getDropContainer` full-screen drop switch.
- [x] `placeholder.vue`: default placeholder + custom placeholder node + fill/reset controlled file list.
- [x] `overflow.vue`: `wrap | scrollX | scrollY` overflow switch + data/disabled toggles.
- [x] `select-files.vue`: `ref.select({ accept, multiple })` by type + `maxCount` limit + blob preview URL lifecycle.
- [x] `with-sender.vue`: Sender-like interaction flow in Vue (`open` header, prefix trigger, submit area, drop-container).

## Component Behavior

- [x] Controlled `items` + `onChange` update flow.
- [x] `onRemove` async gate handling (`false` blocks removal).
- [x] `ref.upload(file)` and `ref.select(options)` imperative APIs.
- [x] Inline/drop placeholder function mode support.
- [x] Semantic styles/classes support (`classes`, `styles`) and x-provider integration.

## Known Gap vs antdx

- [ ] Full `Sender` component parity.
      Current Vue repo (`packages/x/components`) has no `Sender` implementation, so `with-sender/select-files` demos use a Sender-like shell to keep the same attachments interaction patterns.
