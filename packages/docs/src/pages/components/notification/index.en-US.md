---
title: Notification
subtitle: System Notification
description: A wrapper around the browser's native Notification API for pushing system-level notifications.
---

## When To Use

Use when you need to push browser system notifications in AI scenarios, such as task completion or error alerts.

## Examples

<demo src="./demo/hooks.vue">Hooks Usage</demo>
<demo src="./demo/static-method.vue">Static Method</demo>
<demo src="./demo/duration.vue">Auto Close</demo>
<demo src="./demo/close-tag.vue">Close by Tag</demo>

## API

### notification (default export instance)

| Method                | Description                                                     | Type                                    |
| --------------------- | --------------------------------------------------------------- | --------------------------------------- |
| `open(args)`          | Create a system notification                                    | `(args: XNotificationOpenArgs) => void` |
| `close(tags?)`        | Close notifications, closes all if no tags provided             | `(tags?: string[]) => void`             |
| `requestPermission()` | Request notification permission                                 | `() => Promise<NotificationPermission>` |
| `useNotification()`   | Composable usage, returns reactive permission state and methods | `() => UseNotificationType`             |
| `permission`          | Current notification permission state                           | `NotificationPermission`                |

### XNotificationOpenArgs

Extends the browser's native [NotificationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification), with additional properties:

| Property   | Description                                    | Type                                         | Default |
| ---------- | ---------------------------------------------- | -------------------------------------------- | ------- |
| `title`    | Notification title (required)                  | `string`                                     | -       |
| `duration` | Auto-close time in seconds                     | `number`                                     | -       |
| `onClick`  | Click callback, second param is close function | `(event: Event, close?: () => void) => void` | -       |
| `onClose`  | Close callback                                 | `(event: Event) => void`                     | -       |
| `onError`  | Error callback                                 | `(event: Event) => void`                     | -       |
| `onShow`   | Show callback                                  | `(event: Event) => void`                     | -       |

### UseNotificationType

Return type of `useNotification()`:

```ts
type UseNotificationType = [
  { permission: NotificationPermission },
  {
    open: (args: XNotificationOpenArgs) => void;
    close: (tags?: string[]) => void;
    requestPermission: () => Promise<NotificationPermission>;
  },
];
```
