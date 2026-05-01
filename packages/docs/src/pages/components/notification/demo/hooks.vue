<script setup lang="ts">
import { Notification as notification } from "@antdv-next/x";
import { onMounted, ref } from "vue";

const describeInfo: Record<NotificationPermission, string> = {
  denied:
    "Notification permission has been denied, You need to manually reset the notification permissions in the website settings to trigger the permission request pop-up.",
  granted:
    'Notification permission has been granted, you can click the "Open a notification" button to push a  notification.',
  default:
    "Please Request Permission,After the request is approved, you can push notifications.",
};

const permission = ref<NotificationPermission>();

const open = () => {
  notification.open({
    title: "Task completed",
    body: "The task was completed at 13:12",
    badge: "https://x.antdv-next.com/x.svg",
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

const close = () => {
  notification.close();
};

const request = async () => {
  permission.value = await notification.requestPermission();
};

onMounted(() => {
  permission.value = notification.permission;
});
</script>

<template>
  <a-flex vertical gap="middle">
    <template v-if="permission">
      {{ describeInfo[permission] }}
    </template>
    <a-flex gap="middle">
      <a-button
        type="primary"
        :disabled="permission !== 'default'"
        @click="request"
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
        @click="open"
      >
        Open a notification
      </a-button>
      <a-button danger :disabled="permission !== 'granted'" @click="close">
        Destroy All
      </a-button>
    </a-flex>
  </a-flex>
</template>

<docs lang="zh-CN">
hooks调用。发送通知前需要向用户请求通知权限，授权可通知后可发送通知， 若授权禁止通知则不可以发送通知。
</docs>

<docs lang="en-US">
hooks call.Before sending notifications, it is necessary to request notification permission from the user. Once authorized, notifications can be sent. If authorization prohibits notifications, notifications cannot be sent.
</docs>
