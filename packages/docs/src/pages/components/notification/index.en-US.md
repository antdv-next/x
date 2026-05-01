---
title: Notification
subtitle: System Notification
description: Send system-level notifications that are displayed outside the page.
---

## When To Use

- When the agent is performing complex tasks, system-level application notifications can be pushed to keep users informed of the task progress.
- Controlled by the operating system's notification permissions, it is only used for weak notifications.

## Note

- **`Notification` is a system application notification and is controlled by the operating system's notification permissions. If the system notification permission is turned off, the `open` method call of XNotification will have no effect. [System Permission Settings](#system-permission-settings).**
- XNotification is implemented by extending `window.Notification`. If the browser environment does not support Notification, the method calls of XNotification will have no effect.
- The style and effect of XNotification notifications are subject to the current browser environment's support for Notification. For example, the `dir` attribute will be ignored by most browsers.
- XNotification only manages the closing of notifications under the current instance. After the instance changes (for example, the browser page is refreshed), it has no ability to manage and close the sent notifications.

## Examples

<demo src="./demo/hooks.vue">Hooks Call</demo>
<demo src="./demo/duration.vue">Auto Close Delay</demo>
<demo src="./demo/close-tag.vue">Close Specified Notification</demo>
<demo src="./demo/static-method.vue">Static Method</demo>

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

## System Permission Settings

### Change `Notification` settings on Windows

The setting path for different versions of the Windows system will be different. You can refer to the approximate path: "Start" menu > "Settings" > "System" > and then select "Notifications & actions" on the left, after which you can operate on global notifications and application notifications.

### Change `Notification` settings on Mac

On a Mac, use the "Notifications" settings to specify the period during which you do not want to be disturbed by notifications, and control how notifications are displayed in the "Notification Center". To change these settings, choose "Apple" menu > "System Settings", then click "Notifications" in the sidebar (you may need to scroll down).

## FAQ

### I have obtained the permission for the current `origin` to display system notifications, and the `onShow` callback has also been triggered. Why can't the pushed notification be displayed?

`Notification` is a system-level feature. Please ensure that notifications are enabled for the browser application on your device.
