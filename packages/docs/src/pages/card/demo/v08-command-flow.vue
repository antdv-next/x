<script setup lang="ts">
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import { onMounted, ref, defineComponent, h } from "vue";

const commands = ref<any[]>([]);

const Panel = defineComponent({
  name: "CardDemoPanel",
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
  name: "CardDemoText",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => h("div", { class: "xcard-demo-text" }, props.text);
  },
});

const components = {
  Panel,
  Text,
};

onMounted(() => {
  const surfaceId = "booking-v08-demo";

  commands.value = [
    {
      surfaceUpdate: {
        surfaceId,
        components: [
          {
            id: "booking-root",
            component: {
              Panel: {
                children: { explicitList: ["title", "status", "time"] },
              },
            },
          },
          {
            id: "title",
            component: {
              Text: {
                text: { literalString: "Booking Card (v0.8)" },
              },
            },
          },
          {
            id: "status",
            component: {
              Text: {
                text: { path: "/status" },
              },
            },
          },
          {
            id: "time",
            component: {
              Text: {
                text: { path: "/res/time" },
              },
            },
          },
        ],
      },
    },
    {
      dataModelUpdate: {
        surfaceId,
        contents: [
          { key: "status", valueString: "Status: pending" },
          {
            key: "res",
            valueMap: [{ key: "time", valueString: "Time: 10:30" }],
          },
        ],
      },
    },
    {
      beginRendering: {
        surfaceId,
        root: "booking-root",
      },
    },
  ];

  setTimeout(() => {
    commands.value = [
      ...commands.value,
      {
        dataModelUpdate: {
          surfaceId,
          contents: [{ key: "status", valueString: "Status: confirmed" }],
        },
      },
    ];
  }, 800);
});
</script>

<template>
  <XCardBox :commands="commands" :components="components">
    <XCard id="booking-v08-demo" />
  </XCardBox>
</template>

<docs lang="zh-CN">
演示 v0.8 基础链路：surfaceUpdate -> dataModelUpdate -> beginRendering，并展示后续 dataModelUpdate 的响应式更新。
</docs>

<docs lang="en-US">
Demonstrates the v0.8 baseline flow: surfaceUpdate -> dataModelUpdate -> beginRendering, plus reactive updates from later dataModelUpdate commands.
</docs>
