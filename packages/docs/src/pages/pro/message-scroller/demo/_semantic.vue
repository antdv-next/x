<script setup lang="ts">
import { MessageScroller } from "@antdv-next/x-pro";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "组件根元素，承载尺寸、定位与主题样式。",
    viewport: "原生滚动视口，负责真实的流式贴底滚动与手势判定。",
    content: "视口内容层，承载消息节点并参与尺寸观测。",
    rail: "消息导航导轨容器，承载全部消息刻度项。",
    railItem: "导轨中的单个消息刻度项，可聚焦并点击定位。",
    railTick: "导轨刻度条，按与当前项的距离衰减宽度。",
    preview: "单例预览卡片，在各激活项之间连续滑动。",
    backToBottom:
      "回到最新区域，仅在脱离跟随时出现，内部默认渲染回到最新按钮。",
  },
  "en-US": {
    root: "Root element with sizing, positioning, and themed styles.",
    viewport:
      "Native scroll viewport that performs streaming follow and gesture detection.",
    content:
      "Inner content layer that hosts message nodes and participates in size observation.",
    rail: "Message navigation rail container holding every tick item.",
    railItem: "A single rail item that can be focused and clicked to navigate.",
    railTick:
      "Rail tick whose width is attenuated by distance to the active item.",
    preview: "Singleton preview card that slides between active items.",
    backToBottom:
      "Back-to-latest area, rendered only while detached and defaulting to a back-to-latest button.",
  },
};

const { locale } = useLocale();
const texts = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: texts.value.root, version: "0.1.0" },
  { name: "viewport", desc: texts.value.viewport, version: "0.1.0" },
  { name: "content", desc: texts.value.content, version: "0.1.0" },
  { name: "rail", desc: texts.value.rail, version: "0.1.0" },
  { name: "railItem", desc: texts.value.railItem, version: "0.1.0" },
  { name: "railTick", desc: texts.value.railTick, version: "0.1.0" },
  { name: "preview", desc: texts.value.preview, version: "0.1.0" },
  { name: "backToBottom", desc: texts.value.backToBottom, version: "0.1.0" },
]);

const messages = Array.from({ length: 10 }, (_, index) => ({
  id: `semantic-message-${index + 1}`,
  from: index % 2 === 0 ? "user" : "assistant",
  content: `Message ${index + 1}: observe the semantic structures of the conversation viewport.`,
}));
</script>

<template>
  <SemanticPreview component-name="MessageScroller" :semantics="semantics">
    <template #default="{ classes }">
      <MessageScroller
        navigation="rail"
        back-to-bottom
        :items="
          messages.map((message, index) => ({
            id: message.id,
            title: `Message ${index + 1}`,
            description: message.content,
          }))
        "
        :classes="classes"
        :style="{
          height: '280px',
          borderRadius: '14px',
          border: '1px solid var(--ant-color-border)',
        }"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          :data-message-id="message.id"
          style="padding: 8px 16px"
        >
          <div
            style="
              padding: 8px 12px;
              border-radius: 12px;
              background: var(--ant-color-fill-secondary);
            "
          >
            {{ message.content }}
          </div>
        </div>
      </MessageScroller>
    </template>
  </SemanticPreview>
</template>
