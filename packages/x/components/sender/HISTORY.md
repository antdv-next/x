# Sender Managed History Contract

This document defines the design boundary for `SlotTextArea` history. Read it
before changing history, controlled reconciliation, slot rendering, focus, or
selection behavior. Regression tests should protect these rules rather than
individual implementation branches.

## Implementation Architecture

Slot mode uses ProseMirror as its single document, transaction, selection, and
undo/redo engine. Sender-specific code translates `slotConfig` and skill props
to schema nodes and renders managed Vue controls through node views. It must not
maintain a second snapshot stack or treat the rendered DOM as the source of
truth.

Complex custom values live in a separate `HistoryValueStore`; ProseMirror nodes
carry only stable value IDs. Safely cloneable values are snapshotted, opaque
values stay by identity, and controlled reconciliation compares the stored
model rather than display strings. Content-slot spacing is derived rendering,
not historical document content.

## Model Boundary

History owns only editor state:

- the ordered outer document tree;
- slot keys, types, and reported values;
- skill presence and value;
- the intended outer or built-in-input selection.

Render definitions are not historical state. Functions, VNodes, labels,
options, and arbitrary `props` payloads use the latest controlled definition
and must never participate in deep equality or unordered Map/Set matching.
Definition-only prop changes rerender controls without resetting history.
For non-custom slots, emitted controlled values may be formatted display values;
an equivalent echo must retain the current raw model value instead of feeding
the display value through `formatResult` again.

## Value Snapshots

- Plain objects, arrays, Map, Set, Date, RegExp, ArrayBuffer, and typed-array
  graphs may be cloned when every nested value is safely cloneable.
- User class instances, accessors, functions, VNodes, DOM nodes, promises,
  weak collections, SharedArrayBuffer, and other opaque resources stay by
  identity. Do not pass them through `structuredClone`.
- Calling the change callback supplied to a custom slot is an explicit edit.
  Record it even when the reported object has the same identity or display
  string as the previous value. This is how in-place Map/Set/plain-object
  mutations enter history without arbitrary structural comparison.
- `undefined` is a valid explicitly reported custom value, including during
  composition. Pending-value presence must not use the value itself as a
  sentinel.

## Edit Transactions

- `beforeinput`, public mutations, and managed-control callbacks begin an edit;
  the resulting `input` or callback commits it.
- A new edit boundary abandons an uncommitted transaction from another target.
  Leaving the editor without `compositionend` also clears all composition
  state so later edits and history commands remain available.
- From `compositionstart` through `compositionend`, intermediate outer and
  custom-slot updates share one transaction. Commit once at composition end;
  a composition with no model change creates no entry.
- A new edit after undo truncates the redo branch.

## Rendering and Selection

- Undo/redo rebuilds the model, lets Vue portal rendering and controlled echoes
  settle, then restores the selection. Never restore an input caret in the same
  render turn that recreated its Input portal.
- Equivalent controlled echoes keep history. Type-aware comparison of safely
  cloneable values must distinguish Map, Set, and other supported value types
  without unordered permutation matching. A transformed authoritative editor
  value establishes a new baseline and suppresses the obsolete restored
  selection.
- Changes to `disabled` or `readOnly` rerender every managed Input, custom slot,
  and skill, and update contenteditable slots immediately.
- Ordinary native controls inside custom slots own their private selection and
  undo stack. Built-in Input slots participate in Sender history.
- Built-in Input slots must explicitly route Sender keyboard, submit, key-up,
  paste, and file-paste behavior because their node views isolate DOM events.
- The NodeSelection used to represent a focused Input is internal selection
  state: public `insert()` inserts after that Input instead of replacing it.
  `focus({ cursor: "slot" })` targets the editable content node, and
  `focus({ cursor: "all" })` excludes a leading skill.
- A `maxRows` height cap keeps the slot editor vertically scrollable.

## Required Review Matrix

Every history rewrite or refactor must retain focused tests for:

1. structural deletion, outer typing, undo, redo, and redo invalidation;
2. built-in Input value plus exact caret restoration after portal settlement;
3. abandoned no-op control `beforeinput` followed by an outer edit;
4. one outer composition, one custom-slot callback composition, and a
   composition cancelled by focus leaving without `compositionend`;
5. in-place mutation of a safely cloneable value containing Map or Set;
6. identity and methods of an opaque class-instance value after undo;
7. equivalent controlled echoes, transformed controlled baselines including
   Map or Set values, and render-only complex payload or label updates;
8. runtime `disabled` and `readOnly` updates for Input, custom, content, and
   skill controls;
9. public `clear()` and `insert()` remaining inert while `disabled` or
   `readOnly`;
10. closing a focused skill returning focus and the intended selection to the
    outer editor so immediate undo remains available;
11. a clean diff/check that includes every newly imported source file.
12. formatted non-custom controlled echoes retaining raw values and history;
13. focused-Input insertion, keyed content focus, and cursor-all skill safety;
14. built-in Input submit/key-up/file-paste routing;
15. custom composition explicitly reporting `undefined`.

Do not solve a matrix failure by adding consumer-specific branches. Change the
model boundary or transaction invariant, then add the smallest reproduction.
