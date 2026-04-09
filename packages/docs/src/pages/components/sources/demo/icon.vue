<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import {
  GithubOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@antdv-next/icons";

const items: SourcesProps["items"] = [
  {
    key: "twitter",
    title: "Data source from twitter",
    url: "https://x.antdv-next.com/components",
  },
  {
    key: "youtube",
    title: "Data source from youtube",
    url: "https://x.antdv-next.com/components",
  },
  {
    key: "github",
    title: "Data source from github",
    url: "https://x.antdv-next.com/components",
  },
];
</script>

<template>
  <ax-sources title="Used 3 sources" :items="items" expandIconPosition="end">
    <template #iconRender="{ item }">
      <TwitterOutlined v-if="item.key === 'twitter'" />
      <YoutubeOutlined v-else-if="item.key === 'youtube'" />
      <GithubOutlined v-else-if="item.key === 'github'" />
    </template>
  </ax-sources>
</template>

<docs lang="zh-CN">
展示图标。
</docs>

<docs lang="en-US">
Show icon.
</docs>
