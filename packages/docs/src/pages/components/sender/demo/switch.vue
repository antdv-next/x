<script setup lang="ts">
import { SearchOutlined } from "@antdv-next/icons";
import { ref } from "vue";

const controlled = ref(false);
</script>

<template>
  <a-flex vertical gap="middle">
    <a-flex align="center" gap="small">
      Default:
      <ax-sender-switch>
        <template #icon>
          <SearchOutlined />
        </template>
        Deep Search
      </ax-sender-switch>
    </a-flex>
    <a-flex align="center" gap="small">
      Custom checked/unchecked content:
      <ax-sender-switch
        checked-children="Deep Search: on"
        un-checked-children="Deep Search: off"
      >
        <template #icon>
          <SearchOutlined />
        </template>
      </ax-sender-switch>
    </a-flex>
    <a-flex align="center" gap="small">
      Disabled:
      <ax-sender-switch :disabled="true">
        <template #icon>
          <SearchOutlined />
        </template>
        Deep Search
      </ax-sender-switch>
    </a-flex>
    <a-flex align="center" gap="small">
      Loading:
      <ax-sender-switch :loading="true">
        <template #icon>
          <SearchOutlined />
        </template>
        Deep Search
      </ax-sender-switch>
    </a-flex>
    <a-flex align="center" gap="small">
      DefaultValue:
      <ax-sender-switch
        :default-value="true"
        :on-change="
          (checked: boolean) => console.log('Switch toggled', checked)
        "
      >
        <template #icon>
          <SearchOutlined />
        </template>
        Deep Search
      </ax-sender-switch>
    </a-flex>
    <a-flex align="center" gap="small">
      Controlled mode:
      <ax-sender-switch
        :value="controlled"
        :on-change="(v: boolean) => (controlled = v)"
      >
        <template #icon>
          <SearchOutlined />
        </template>
        Deep Search
      </ax-sender-switch>
    </a-flex>
  </a-flex>
</template>

<docs lang="zh-CN">
功能开关，用于`Sender`功能开启/关闭。
</docs>

<docs lang="en-US">
Feature switch, used to enable/disable features of `Sender`.
</docs>
