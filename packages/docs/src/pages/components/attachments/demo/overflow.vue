<template>
  <Flex vertical gap="middle">
    <Flex gap="middle" align="center">
      <Segmented
        v-model:value="overflow"
        :options="[
          { value: 'wrap', label: 'Wrap' },
          { value: 'scrollX', label: 'Scroll X' },
          { value: 'scrollY', label: 'Scroll Y' },
        ]"
        :style="{ marginInlineEnd: 'auto' }"
      />
      <Switch
        v-model:checked="hasData"
        checked-children="Data"
        un-checked-children="Data"
      />
      <Switch
        v-model:checked="disabled"
        checked-children="Disabled"
        un-checked-children="Disabled"
      />
    </Flex>

    <Attachments
      :overflow="overflow"
      :items="items"
      @change="onChange"
      :before-upload="() => false"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </Flex>
</template>

<script setup lang="ts">
import { CloudUploadOutlined } from "@antdv-next/icons";
import { Attachments } from "@antdv-next/x";
import { Flex, Segmented, Switch } from "antdv-next";
import { computed, h, ref } from "vue";

interface Attachment {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  thumbUrl?: string;
  percent?: number;
  response?: any;
  size?: number;
}

const presetFiles: Attachment[] = Array.from({ length: 30 }).map(
  (_, index) => ({
    uid: String(index),
    name: `file-${index}.jpg`,
    status: "done" as const,
    thumbUrl:
      "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
    url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  }),
);

const placeholder = {
  icon: h(CloudUploadOutlined),
  title: "Click or Drop files here",
  description: "Support file type: image, video, audio, document, etc.",
};

const overflow = ref<"wrap" | "scrollX" | "scrollY">("wrap");
const disabled = ref(false);
const items = ref<Attachment[]>([...presetFiles]);

const hasData = computed({
  get: () => items.value.length !== 0,
  set: checked => {
    items.value = checked ? [...presetFiles] : [];
  },
});

const onChange = ({ fileList }: { fileList: Attachment[] }) => {
  items.value = fileList;
};
</script>
