<script setup lang="ts">
import type { XNotificationOpenArgs } from "@antdv-next/x";

import { Notification as notification } from "@antdv-next/x";
import { Button, Flex } from "antdv-next";

const describeInfo: Record<NotificationPermission, string> = {
  denied: "通知权限已被拒绝，你需要在浏览器网站设置中手动重置通知权限。",
  granted: "通知权限已授予，你可以点击「发送通知」按钮来推送一条通知。",
  default: "请先请求权限，授权后即可推送通知。",
};

const openData: XNotificationOpenArgs = {
  title: "任务完成",
  body: "任务于 13:12 完成",
  icon: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original",
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
};

const [{ permission }, { open, requestPermission, close }] =
  notification.useNotification();
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
        @click="open(openData)"
      >
        发送通知
      </Button>
      <Button danger :disabled="permission !== 'granted'" @click="close()">
        关闭所有
      </Button>
    </Flex>
  </Flex>
</template>
