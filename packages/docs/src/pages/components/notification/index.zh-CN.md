---
title: Notification
subtitle: 系统通知
description: 封装浏览器原生 Notification API，用于向用户推送系统级通知。
---

## 何时使用

需要在 AI 场景中（如任务完成、异常告警等）推送浏览器系统通知时使用。

## 代码演示

<demo src="./demo/hooks.vue">Hooks 用法</demo>
<demo src="./demo/static-method.vue">静态方法</demo>
<demo src="./demo/duration.vue">自动关闭</demo>
<demo src="./demo/close-tag.vue">按 Tag 关闭</demo>

## API

### notification（默认导出实例）

| 方法                  | 说明                                      | 类型                                    |
| --------------------- | ----------------------------------------- | --------------------------------------- |
| `open(args)`          | 创建一条系统通知                          | `(args: XNotificationOpenArgs) => void` |
| `close(tags?)`        | 关闭通知，不传参则关闭全部                | `(tags?: string[]) => void`             |
| `requestPermission()` | 请求通知权限                              | `() => Promise<NotificationPermission>` |
| `useNotification()`   | Composable 用法，返回响应式权限状态和方法 | `() => UseNotificationType`             |
| `permission`          | 当前通知权限状态                          | `NotificationPermission`                |

### XNotificationOpenArgs

继承浏览器原生 [NotificationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification)，额外增加：

| 属性       | 说明                                   | 类型                                         | 默认值 |
| ---------- | -------------------------------------- | -------------------------------------------- | ------ |
| `title`    | 通知标题（必填）                       | `string`                                     | -      |
| `duration` | 自动关闭时间（秒），不设置则不自动关闭 | `number`                                     | -      |
| `onClick`  | 点击回调，第二个参数为关闭函数         | `(event: Event, close?: () => void) => void` | -      |
| `onClose`  | 关闭回调                               | `(event: Event) => void`                     | -      |
| `onError`  | 错误回调                               | `(event: Event) => void`                     | -      |
| `onShow`   | 显示回调                               | `(event: Event) => void`                     | -      |

### UseNotificationType

`useNotification()` 返回值类型：

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
