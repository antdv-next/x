<script setup lang="ts">
import { SettingOutlined } from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex, Popover, Space, Switch, Typography } from "antdv-next";
import { computed, ref } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const { Text } = Typography;
const { isDark } = useDarkMode();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const escapeRawHtml = ref(true);
const openLinksInNewTab = ref(true);
const scriptCloseTag = "<" + "/script>";

const markdown = `
### Links & raw HTML

- [Ant Design](https://ant.design) · [GitHub](https://github.com)
- Reference: [docs][1]

[1]: https://x.antdv-next.com/markdown

Raw HTML (when not escaped, is rendered as DOM):

<div>Block div</div>

<script>alert('script')${scriptCloseTag}

<img src=x onerror="alert(1)">
`;
</script>

<template>
  <div>
    <Space size="middle" style="margin-bottom: 16px">
      <Popover trigger="click" placement="bottomLeft">
        <template #content>
          <Flex vertical :gap="10" style="min-width: 180px">
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 160px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Escape Raw HTML</Text
              >
              <Switch size="small" v-model:checked="escapeRawHtml" />
            </Flex>
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 160px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Open Links In New Tab</Text
              >
              <Switch size="small" v-model:checked="openLinksInNewTab" />
            </Flex>
          </Flex>
        </template>
        <Button type="default" size="small">
          <template #icon>
            <SettingOutlined />
          </template>
          Config
        </Button>
      </Popover>
    </Space>

    <XMarkdown
      :class-name="markdownClass"
      :content="markdown"
      :escape-raw-html="escapeRawHtml"
      :open-links-in-new-tab="openLinksInNewTab"
    />
  </div>
</template>

<docs lang="zh-CN">
安全示例：对齐 antdx 交互，动态切换 HTML 转义和链接新开页。
</docs>

<docs lang="en-US">
Security demo aligned with antdx: toggle raw-HTML escaping and new-tab link behavior.
</docs>
