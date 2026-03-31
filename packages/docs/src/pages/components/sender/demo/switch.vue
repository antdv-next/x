<script setup lang="ts">
import { SearchOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Flex } from "antdv-next";
import { h, ref } from "vue";

const controlled = ref(false);
</script>

<template>
  <Flex vertical gap="middle">
    <Flex align="center" gap="small">
      Default:
      <Sender.Switch :icon="h(SearchOutlined)">Deep Search</Sender.Switch>
    </Flex>
    <Flex align="center" gap="small">
      Custom checked/unchecked:
      <Sender.Switch
        checked-children="Deep Search: on"
        un-checked-children="Deep Search: off"
        :icon="h(SearchOutlined)"
      />
    </Flex>
    <Flex align="center" gap="small">
      Disabled:
      <Sender.Switch :disabled="true" :icon="h(SearchOutlined)"
        >Deep Search</Sender.Switch
      >
    </Flex>
    <Flex align="center" gap="small">
      Loading:
      <Sender.Switch :loading="true" :icon="h(SearchOutlined)"
        >Deep Search</Sender.Switch
      >
    </Flex>
    <Flex align="center" gap="small">
      DefaultValue:
      <Sender.Switch
        :icon="h(SearchOutlined)"
        :default-value="true"
        :on-change="(checked: boolean) => console.log('toggled', checked)"
      >
        Deep Search
      </Sender.Switch>
    </Flex>
    <Flex align="center" gap="small">
      Controlled:
      <Sender.Switch
        :icon="h(SearchOutlined)"
        :value="controlled"
        :on-change="(v: boolean) => (controlled = v)"
      >
        Deep Search
      </Sender.Switch>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
功能开关，用于`Sender`功能开启/关闭。
</docs>

<docs lang="en-US">
Feature switch, used to enable/disable features of `Sender`.
</docs>
