<template>
  <App>
    <Flex :style="{ minHeight: '250px' }" align="flex-end">
      <div ref="containerRef" :style="senderStyle">
        <div v-show="open" :style="headerStyle">
          <Attachments
            ref="attachmentsRef"
            multiple
            :max-count="MAX_COUNT"
            :before-upload="() => false"
            :items="items"
            @change="onChange"
            :placeholder="placeholder"
            :get-drop-container="getDropContainer"
          />
        </div>

        <Flex align="flex-end" gap="small">
          <Badge :dot="items.length > 0 && !open">
            <Dropdown
              :trigger="['click']"
              :menu="acceptMenu"
              placement="topLeft"
              :arrow="{ pointAtCenter: true }"
            >
              <Button :disabled="items.length >= MAX_COUNT" type="text">
                <template #icon>
                  <LinkOutlined />
                </template>
              </Button>
            </Dropdown>
          </Badge>

          <Input.TextArea
            v-model:value="text"
            :auto-size="{ minRows: 1, maxRows: 4 }"
            placeholder="Type a message..."
            :style="{ flex: 1 }"
          />
          <Button
            type="primary"
            :disabled="!text.trim() && !items.length"
            @click="handleSubmit"
          >
            Submit
          </Button>
        </Flex>
      </div>
    </Flex>
  </App>
</template>

<script setup lang="ts">
import {
  CloudUploadOutlined,
  FileImageOutlined,
  FileWordOutlined,
  LinkOutlined,
} from "@antdv-next/icons";
import {
  App,
  Badge,
  Button,
  Dropdown,
  Flex,
  Input,
  message,
  theme,
} from "antdv-next";
import { computed, h, onBeforeUnmount, ref, watch } from "vue";

import type { AttachmentsRef } from "..";

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

const { token } = theme.useToken();

const attachmentsRef = ref<AttachmentsRef>();
const containerRef = ref<HTMLDivElement>();
const items = ref<Attachment[]>([]);
const text = ref("");
const open = ref(false);

const senderStyle = computed(() => ({
  width: "100%",
  maxWidth: "720px",
  padding: `${token.value.paddingSM}px`,
  borderRadius: `${token.value.borderRadiusLG}px`,
  background: token.value.colorBgContainer,
  border: `${token.value.lineWidth}px ${token.value.lineType} ${token.value.colorBorderSecondary}`,
}));

const headerStyle = computed(() => ({
  marginBottom: `${token.value.marginSM}px`,
}));

const getDropContainer = () => containerRef.value;

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

const clearObjectUrls = (list: Attachment[]) => {
  list.forEach(item => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
};

const onChange = ({
  file,
  fileList,
}: {
  file: Attachment;
  fileList: Attachment[];
}) => {
  if (file.status === "removed" && file.url?.startsWith("blob:")) {
    URL.revokeObjectURL(file.url);
  }

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

const selectFile = (key: string) => {
  attachmentsRef.value?.select({
    accept: key === "image" ? ".png,.jpg,.jpeg" : ".doc,.docx",
    multiple: true,
  });
};

const acceptMenu = computed(() => ({
  items: [
    {
      key: "image",
      label: h(
        Flex,
        { gap: "small", align: "center" },
        {
          default: () => [h(FileImageOutlined), h("span", "Image")],
        },
      ),
    },
    {
      key: "docs",
      label: h(
        Flex,
        { gap: "small", align: "center" },
        {
          default: () => [h(FileWordOutlined), h("span", "Docs")],
        },
      ),
    },
  ],
  onClick: ({ key }: { key: string | number }) => {
    selectFile(String(key));
  },
}));

const handleSubmit = () => {
  message.info(
    `Mock Submit: "${text.value || "(empty)"}", files: ${items.value.length}`,
  );
  clearObjectUrls(items.value);
  items.value = [];
  text.value = "";
};

watch(
  () => items.value.length,
  length => {
    open.value = length > 0;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearObjectUrls(items.value);
});
</script>
