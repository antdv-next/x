# Sender Review and Ownership Rules

These instructions apply to changes under `packages/x/components/sender`.
Review the Sender implementation against supported public behavior and the
invariants below. Do not expand the framework's responsibility to arbitrary
behavior hidden inside a consumer-provided custom slot.

## Evidence Required for Review Findings

A correctness finding must describe a reproducible sequence using a supported
public API or a normal browser editing action. Include:

- the initial `slotConfig`, skill, controlled state, and relevant focus or
  selection state;
- the exact input, keyboard, clipboard, composition, or prop-update sequence;
- the expected and actual editor value, document, cursor, or history state;
- the framework invariant or public contract that is violated.

Clean-checkout build failures, runtime exceptions, data loss, and reproducible
history corruption remain valid findings. Do not suppress such findings merely
because they are outside the managed-history implementation.

Do not report a framework bug based only on direct mutation of private editor
DOM, private maps or refs, unreported state inside a custom renderer, or a
hypothetical custom control with no reproducible supported integration path.

## Framework Responsibilities

Sender owns:

- the outer editable document and the slot and skill nodes it creates;
- ordering and restoration of text, native paragraph nodes, managed slots, and
  skill nodes in managed-history snapshots;
- undo and redo stack integrity, cursor restoration, redo invalidation, and
  composition grouping;
- reconciliation of authoritative controlled `slotConfig` and `skill` props;
- preventing ordinary events from nested native form controls from being
  mistaken for structural edits of the outer editor;
- changes reported by a custom slot through the callback supplied by Sender,
  to the extent that the reported value can be represented safely in history.

Prefer fixes expressed as general editor invariants. Do not add branches for a
single custom slot implementation, business-specific component, or one-off
event sequence when the behavior cannot be generalized.

## Consumer and Custom-Slot Responsibilities

The consumer or custom-slot author owns:

- internal state that is not reported through Sender's supplied change
  callback;
- a nested editor's private undo stack, selection model, and bespoke keyboard
  shortcuts;
- direct or imperative mutations that bypass Sender's public APIs and change
  callbacks;
- event isolation required by nonstandard composite controls beyond ordinary
  native `input`, `textarea`, and `select` editing;
- mutable internals of opaque runtime resources that cannot be cloned safely,
  such as promises, weak collections, platform handles, or custom native
  objects retained by identity.

When a reported behavior falls in this section, explain the integration
requirement instead of adding compatibility code to `SlotTextArea`.

## Managed-History Invariants

- Plain text may use native browser history until managed history is activated.
- Once managed history is active, every managed edit must move only the managed
  stack; native undo or redo must not mutate the document behind that stack.
- One undo or redo restores one complete document snapshot and its intended
  selection. Restoring a snapshot must not itself create a history entry.
- A new edit after undo discards the redo branch.
- Consecutive typing may be grouped only when the second edit starts at the
  exact collapsed selection produced by the first edit. Moving the caret or
  changing the selection starts a new history group.
- One IME composition is one history operation. A cancelled composition is not
  a history operation.
- Equivalent controlled echoes preserve the current undo and redo stack.
  A transformed authoritative controlled value is reconciled after restoration
  and establishes a new baseline.
- Backspace and Delete originating from a nested native form control must not
  invoke outer structural slot deletion. Managed undo and redo shortcuts may
  still be routed through Sender when the slot participates in managed history.
- Keyboard and `beforeinput` history commands must have equivalent managed
  undo and redo behavior.

## Validation Expectations

For history changes, add the smallest regression test that fails before the
fix. Cover both the managed path and the corresponding native or nested-control
boundary when applicable. Preserve the public `SenderProps`, `SenderRef`,
`slotConfig`, skill, and `onChange` contracts unless an API change is explicitly
requested.

Run the relevant Sender tests, repository tests, checks, type check, and package
build according to the root `AGENTS.md`.
