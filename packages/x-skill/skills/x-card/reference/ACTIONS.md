# Actions

Actions carry user interactions from rendered components back to your application (and then, typically, to the Agent).

## Two sides of an action

| Side                     | Where it lives                         | Purpose                                                                            |
| ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Command declaration      | `component.action` in the A2UI command | Names the event and declares which context keys map to data-model paths            |
| Component implementation | Your Vue component                     | Calls `onAction(name, context)` with the values                                    |
| Runtime                  | `XCardCard`                            | Writes supplied values back to the declared paths, then calls the Box's `onAction` |

> **Version note**: action write-back uses the Card's current protocol version (the last version-bearing command wins per Surface). Mixing a v0.8 command into a v0.9 Surface makes v0.9 `action.event.context` stop producing write-backs. Keep one version per Surface.

## v0.9

### Declare it

```ts
{
  id: "submit-btn",
  component: "Button",
  label: "Confirm",
  action: {
    event: {
      name: "confirm_booking",
      context: {
        datetime: { path: "/reservation/datetime" },
        guests: { path: "/reservation/guests" },
      },
    },
  },
}
```

The `context` values are **write targets**, not values to read. They are intentionally not resolved before reaching the component.

### Implement the component

```tsx
const Button = defineComponent({
  name: "CardButton",
  props: {
    label: { type: String, default: "" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props) {
    const handleClick = () => {
      const event = (props.action as any)?.event;
      if (!event?.name) return;
      // Keys must match action.event.context keys for write-back to happen.
      props.onAction?.(event.name, {
        datetime: "2025-12-16T19:00:00Z",
        guests: 3,
      });
    };
    return () => <button onClick={handleClick}>{props.label}</button>;
  },
});
```

### What the runtime does

1. For each key in `action.event.context` whose value is `{ path }`, if the component supplied that key, writes the supplied value at the path.
2. Calls `XCardBox`'s `onAction` with:

```ts
interface ActionPayload {
  name: string; // "confirm_booking"
  surfaceId: string; // the Card id
  context: Record<string, any>; // the component-supplied values
  actionConfig?: any; // the resolved action object
}
```

Important local behaviour:

- **`payload.context` is the component-supplied context**, not a full data-model snapshot and not automatically resolved from the declared paths. A component that passes `{}` produces `payload.context === {}` even if `action.event.context` declares paths.
- Write-back only happens for keys the component actually supplies (`undefined` values are skipped).
- Extra keys supplied by the component appear in `payload.context` but are not written to the model.

So the component is responsible for providing the values; the command only tells the runtime where to store them.

## v0.8

v0.8 action objects are flat and use an array of `{ key, value }` entries:

```ts
{
  id: "submit",
  component: {
    Button: {
      label: { literalString: "Confirm" },
      action: {
        name: "confirm_booking",
        context: [{ key: "formData", value: { path: "/formData" } }],
      },
    },
  },
}
```

Component:

```tsx
const handleClick = () => {
  const action = props.action as any;
  if (!action?.name) return;
  props.onAction?.(action.name, { formData: { guests: 3 } });
};
```

The runtime extracts each entry's `value.path` and writes the supplied `formData` there, then emits `ActionPayload` as in v0.9.

## Handling the payload

```ts
function handleAction(payload: ActionPayload) {
  // 1. Inspect what happened
  console.log(payload.name, payload.surfaceId, payload.context);

  // 2. Continue the flow: send it to the Agent or update local state
  sendToAgent({
    type: "userAction",
    name: payload.name,
    context: payload.context,
  });
}
```

Typical Agent responses:

- `updateComponents` / `updateDataModel` — continue the same Surface;
- `deleteSurface` — close the flow;
- `createSurface` — open a new Surface (e.g. a success screen).

## Interaction without actions

For pure state edits (typing in a field, toggling a checkbox), prefer `onDataChange(path, value)` instead of an action. Actions are for events the Agent should react to; data changes are for local two-way binding. See [DATA_BINDING.md](DATA_BINDING.md).

## Checklist

- [ ] Event name is set in the command and read from the correct location (`action.event.name` in v0.9, `action.name` in v0.8).
- [ ] Component-supplied context keys match the declared `context` keys.
- [ ] The Box has an `onAction` handler.
- [ ] The handler does not assume `payload.context` contains the whole data model.
