<template>
  <App>
    <div ref="containerRef">
      <Flex vertical gap="middle" align="flex-start">
        <Attachments
          :before-upload="() => false"
          :get-drop-container="getDropContainer"
          :placeholder="placeholder"
          @change="onChange"
        >
          <Button type="text">
            <LinkOutlined />
          </Button>
        </Attachments>

        <Switch
          v-model:checked="fullScreenDrop"
          checked-children="Full screen drop"
          un-checked-children="Full screen drop"
        />
      </Flex>
    </div>
  </App>
</template>

<script setup lang="ts">
import { CloudUploadOutlined, LinkOutlined } from "@antdv-next/icons";
import { App, Button, Flex, Switch, message } from "antdv-next";
import { h, ref } from "vue";

const fullScreenDrop = ref(false);
const containerRef = ref<HTMLDivElement>();

const placeholder = {
  icon: h(CloudUploadOutlined),
  title: "Drag & Drop files here",
  description: "Support file type: image, video, audio, document, etc.",
};

const getDropContainer = () =>
  fullScreenDrop.value ? document.body : containerRef.value;

const onChange = ({ file }: { file?: { name?: string } }) => {
  if (file?.name) {
    message.info(`Mock upload: ${file.name}`);
  }
};
</script>
