<script setup lang="ts">
import { Notification as notification } from "@antdv-next/x";
import { Button, Flex } from "antdv-next";

const describeInfo: Record<NotificationPermission, string> = {
  denied: "通知权限已被拒绝，你需要在浏览器网站设置中手动重置通知权限。",
  granted: "通知权限已授予，你可以点击「发送通知」按钮来推送一条通知。",
  default: "请先请求权限，授权后即可推送通知。",
};

const [{ permission }, { open, requestPermission }] =
  notification.useNotification();

const openClick = () => {
  open({
    title: "任务完成",
    body: "任务于 13:12 完成（4.5 秒后自动关闭）",
    duration: 4.5,
    icon: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original",
    onClick: (event, close) => {
      console.log("onClick", event, close);
      close?.();
    },
    onClose: event => {
      console.log("onClose", event);
    },
  });
};
</script>

<template>
  <Flex vertical gap="middle">
    <span>{{ describeInfo[permission] }}</span>
    <Flex gap="middle">
      <Button
        type="primary"
        :disabled="permission !== 'default'"
        @click="requestPermission()"
      >
        {{ permission === "default" ? "请求权限" : `通知权限：${permission}` }}
      </Button>
      <Button
        type="primary"
        :disabled="permission !== 'granted'"
        @click="openClick"
      >
        发送通知（自动关闭）
      </Button>
    </Flex>
  </Flex>
</template>
