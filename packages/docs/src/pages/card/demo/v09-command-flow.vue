<script setup lang="ts">
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import { defineComponent, h, onMounted, ref } from "vue";

const commands = ref<any[]>([]);

const Panel = defineComponent({
  name: "CardDemoPanelV09",
  setup(_, { slots }) {
    return () =>
      h(
        "div",
        {
          style: {
            border: "1px solid #d9d9d9",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "360px",
          },
        },
        slots.default?.(),
      );
  },
});

const Text = defineComponent({
  name: "CardDemoTextV09",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => h("div", { class: "xcard-v09-demo-text" }, props.text);
  },
});

const components = {
  Panel,
  Text,
};

onMounted(() => {
  const surfaceId = "booking-v09-demo";

  commands.value = [
    {
      version: "v0.9",
      createSurface: {
        surfaceId,
      },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: [
          {
            id: "root",
            component: "Panel",
            children: ["title", "status", "time"],
          },
          {
            id: "title",
            component: "Text",
            text: "Booking Card (v0.9)",
          },
          {
            id: "status",
            component: "Text",
            text: { path: "/status" },
          },
          {
            id: "time",
            component: "Text",
            text: { path: "/res/time" },
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId,
        path: "/status",
        value: "Status: pending",
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId,
        path: "/res/time",
        value: "Time: 14:00",
      },
    },
  ];

  setTimeout(() => {
    commands.value = [
      ...commands.value,
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId,
          path: "/status",
          value: "Status: confirmed",
        },
      },
    ];
  }, 800);
});
</script>

<template>
  <XCardBox :commands="commands" :components="components">
    <XCard id="booking-v09-demo" />
  </XCardBox>
</template>

<docs lang="zh-CN">
演示 v0.9 基础链路：createSurface -> updateComponents -> updateDataModel，并展示后续 updateDataModel 的响应式更新。
</docs>

<docs lang="en-US">
Demonstrates the v0.9 baseline flow: createSurface -> updateComponents -> updateDataModel, plus reactive updates from later updateDataModel commands.
</docs>
