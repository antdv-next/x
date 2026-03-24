<template>
  <App>
    <Flex :style="{ minHeight: '250px' }" align="flex-end">
      <Sender
        ref="senderRef"
        :header="senderHeader"
        :prefix="prefixRender"
        :value="text"
        :on-change="onTextChange"
        :on-submit="onSubmit"
      />
    </Flex>
  </App>
</template>

<script setup lang="ts">
import type { SenderRef } from "@antdv-next/x";

import { CloudUploadOutlined, LinkOutlined } from "@antdv-next/icons";
import { Attachments, Sender } from "@antdv-next/x";
import { App, Badge, Button, Flex, Typography } from "antdv-next";
import { h, onBeforeUnmount, ref } from "vue";

interface Attachment {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  thumbUrl?: string;
  percent?: number;
  response?: any;
  size?: number;
  originFileObj?: File;
}

const open = ref(true);
const items = ref<Attachment[]>([]);
const text = ref("");

const { notification } = App.useApp();
const senderRef = ref<SenderRef>();

onBeforeUnmount(() => {
  items.value.forEach(item => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
});

const onChange = ({
  file,
  fileList,
}: {
  file: Attachment;
  fileList: Attachment[];
}) => {
  items.value = fileList.map(item => {
    if (
      item.uid === file.uid &&
      file.status !== "removed" &&
      item.originFileObj
    ) {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return {
        ...item,
        url: URL.createObjectURL(item.originFileObj),
      };
    }
    return item;
  });
};

const placeholder = (type: "inline" | "drop") =>
  type === "drop"
    ? {
        title: "Drop file here",
      }
    : {
        icon: h(CloudUploadOutlined),
        title: "Upload files",
        description: "Click or drag files to this area to upload",
      };

const senderHeader = () =>
  h(
    Sender.Header,
    {
      title: "Attachments",
      open: open.value,
      onOpenChange: (val: boolean) => {
        open.value = val;
      },
      styles: {
        content: {
          padding: 0,
        },
      },
    },
    {
      default: () =>
        h(Attachments, {
          beforeUpload: () => false,
          items: items.value,
          onChange,
          placeholder,
          getDropContainer: () => senderRef.value?.nativeElement,
        }),
    },
  );

const prefixRender = () =>
  h(
    Badge,
    {
      dot: items.value.length > 0 && !open.value,
    },
    {
      default: () =>
        h(Button, {
          onClick: () => {
            open.value = !open.value;
          },
          icon: h(LinkOutlined),
        }),
    },
  );

const onTextChange = (value: string) => {
  text.value = value;
};

const submitDescription = () =>
  h(Typography, null, {
    default: () =>
      h("ul", [
        h("li", `You said: ${text.value}`),
        h("li", [
          `Attachments count: ${items.value.length}`,
          h(
            "ul",
            items.value.map(item => h("li", { key: item.uid }, item.name)),
          ),
        ]),
      ]),
  });

const onSubmit = () => {
  notification.info({
    title: "Mock Submit",
    description: submitDescription(),
  });

  items.value = [];
  text.value = "";
};
</script>
