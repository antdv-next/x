<script setup lang="ts">
import { Notification as notification } from "@antdv-next/x";

const describeInfo: Record<NotificationPermission, string> = {
  denied:
    "Notification permission has been denied, You need to manually reset the notification permissions in the website settings to trigger the permission request pop-up.",
  granted:
    'Notification permission has been granted, you can click the "Open a notification" button to push a  notification.',
  default:
    "Please Request Permission,After the request is approved, you can push notifications.",
};

const [{ permission }, { open, requestPermission }] =
  notification.useNotification();

const openClick = () => {
  open({
    title: "Task completed",
    body: "The task was completed at 13:12",
    duration: 4.5,
    icon: "https://x.antdv-next.com/x.svg",
    onClick: (event, close) => {
      console.log("onClick", event, close);
      close?.();
    },
    onClose: event => {
      console.log("onClose", event);
    },
    onError: event => {
      console.log("onError", event);
    },
    onShow: event => {
      console.log("onShow", event);
    },
  });
};
</script>

<template>
  <a-flex vertical gap="middle">
    {{ describeInfo[permission] }}
    <a-flex gap="middle">
      <a-button
        type="primary"
        :disabled="permission !== 'default'"
        @click="requestPermission"
      >
        {{
          permission === "default"
            ? "Please Request Permission"
            : `Notification permission has been ${permission}`
        }}
      </a-button>
      <a-button
        type="primary"
        :disabled="permission !== 'granted'"
        @click="openClick"
      >
        Open a notification
      </a-button>
    </a-flex>
  </a-flex>
</template>

<docs lang="zh-CN">
使用`duration`设置通知框自动关闭的延时。
</docs>

<docs lang="en-US">
Use 'duration' to set the delay for the notification box to automatically close.
</docs>
