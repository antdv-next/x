<template>
  <App>
    <Flex :style="{ minHeight: '250px' }" align="flex-end">
      <div ref="containerRef" :style="senderStyle">
        <div v-show="open" :style="headerStyle">
          <Attachments
            :before-upload="() => false"
            :items="items"
            @change="onChange"
            :placeholder="placeholder"
            :get-drop-container="getDropContainer"
          />
        </div>

        <Flex align="flex-end" gap="small">
          <Badge :dot="items.length > 0 && !open">
            <Button @click="open = !open">
              <template #icon>
                <LinkOutlined />
              </template>
            </Button>
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
import { CloudUploadOutlined, LinkOutlined } from "@antdv-next/icons";
import { App, Badge, Button, Flex, Input, message, theme } from "antdv-next";
import { computed, h, onBeforeUnmount, ref } from "vue";

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

const containerRef = ref<HTMLDivElement>();
const items = ref<Attachment[]>([]);
const text = ref("");
const open = ref(true);

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

const handleSubmit = () => {
  message.info(
    `Mock Submit: "${text.value || "(empty)"}", files: ${items.value.length}`,
  );
  clearObjectUrls(items.value);
  items.value = [];
  text.value = "";
};

onBeforeUnmount(() => {
  clearObjectUrls(items.value);
});
</script>
