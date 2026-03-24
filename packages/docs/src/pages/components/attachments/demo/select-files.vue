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
import type { AttachmentsRef, SenderRef } from "@antdv-next/x";

import {
  CloudUploadOutlined,
  FileImageOutlined,
  FileWordOutlined,
  LinkOutlined,
} from "@antdv-next/icons";
import { Attachments, Sender } from "@antdv-next/x";
import {
  App,
  Badge,
  Button,
  Dropdown,
  Flex,
  Typography,
  notification,
} from "antdv-next";
import { h, onBeforeUnmount, ref, watch } from "vue";

const MAX_COUNT = 5;

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

const open = ref(false);
const items = ref<Attachment[]>([]);
const text = ref("");

const senderRef = ref<SenderRef>();
const attachmentsRef = ref<AttachmentsRef>();

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
      closable: false,
      forceRender: true,
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
          ref: attachmentsRef,
          multiple: true,
          maxCount: MAX_COUNT,
          beforeUpload: () => false,
          items: items.value,
          onChange,
          placeholder,
          getDropContainer: () => senderRef.value?.nativeElement,
        }),
    },
  );

const selectFile = (key: string) => {
  attachmentsRef.value?.select({
    accept: key === "image" ? ".png,.jpg,.jpeg" : ".doc,.docx",
    multiple: true,
  });
};

const acceptItems = [
  {
    key: "image",
    label: h(
      Flex,
      {
        gap: "small",
      },
      {
        default: () => [h(FileImageOutlined), h("span", "Image")],
      },
    ),
  },
  {
    key: "docs",
    label: h(
      Flex,
      {
        gap: "small",
      },
      {
        default: () => [h(FileWordOutlined), h("span", "Docs")],
      },
    ),
  },
];

const prefixRender = () =>
  h(
    Badge,
    {
      dot: items.value.length > 0 && !open.value,
    },
    {
      default: () =>
        h(
          Dropdown,
          {
            trigger: ["click"],
            menu: {
              items: acceptItems,
              onClick: ({ key }: { key: string | number }) => {
                selectFile(String(key));
              },
            },
            placement: "topLeft",
            arrow: {
              pointAtCenter: true,
            },
          },
          {
            default: () =>
              h(Button, {
                disabled: items.value.length >= MAX_COUNT,
                type: "text",
                icon: h(LinkOutlined),
              }),
          },
        ),
    },
  );

const onTextChange = (value: string) => {
  text.value = value;
};

watch(
  () => items.value.length,
  length => {
    open.value = length > 0;
  },
  {
    immediate: true,
  },
);

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
