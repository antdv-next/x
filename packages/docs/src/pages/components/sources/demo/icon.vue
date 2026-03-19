<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import {
  GithubOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from "@antdv-next/icons";
import { Sources } from "@antdv-next/x";
import { h } from "vue";

const items: SourcesProps["items"] = [
  {
    title: "Data source from twitter",
    url: "https://x.antdv-next.com/components",
    icon: h(TwitterOutlined),
  },
  {
    title: "Data source from youtube",
    url: "https://x.antdv-next.com/components",
    icon: h(YoutubeOutlined),
  },
  {
    title: "Data source from github",
    url: "https://x.antdv-next.com/components",
    icon: h(GithubOutlined),
  },
];
</script>

<template>
  <Sources title="Used 3 sources" :items="items" expandIconPosition="end" />
</template>

<docs lang="zh-CN">
展示图标。
</docs>

<docs lang="en-US">
Show icon.
</docs>
