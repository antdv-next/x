<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { Button, Flex, Space } from "antdv-next";
import { h, onBeforeUnmount, ref } from "vue";

const loading = ref(true);
const src = ref("");
const loadingTimer = ref<number>();

const createPlaceholder = () =>
  h(FileCard, {
    imageProps: {
      alt: "placeholder image",
      preview: false,
    },
    name: "image-file-placeholder.png",
    src: src.value
      ? `${src.value}?x-oss-process=image/blur,r_50,s_50/quality,q_1/resize,m_mfit,h_200,w_200`
      : "",
  });

const handleStartLoading = () => {
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value);
    loadingTimer.value = undefined;
  }

  loading.value = true;
  src.value = "";
};

const handleLoadComplete = () => {
  src.value =
    "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png";

  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value);
  }

  loadingTimer.value = window.setTimeout(() => {
    loading.value = false;
    loadingTimer.value = undefined;
  }, 400);
};

onBeforeUnmount(() => {
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value);
  }
});
</script>

<template>
  <Flex gap="middle" vertical>
    <Space>
      <Button :disabled="loading" @click="handleStartLoading">
        Start Loading
      </Button>
      <Button @click="handleLoadComplete"> Load Complete </Button>
    </Space>

    <FileCard
      :loading="loading"
      :styles="{
        file: {
          width: 200,
        },
      }"
      :spin-props="{
        size: 'small',
      }"
      :image-props="{
        placeholder: createPlaceholder(),
      }"
      name="image-file.png"
      :src="src ? `${src}?${Date.now()}` : ''"
    />

    <FileCard
      :loading="loading"
      :image-props="{
        placeholder: createPlaceholder(),
      }"
      name="image-file.png"
      :src="src ? `${src}?${Date.now()}` : ''"
    />
  </Flex>
</template>

<docs lang="zh-CN">
可使用 loading、[Image](https://ant-design.antgroup.com/components/image-cn#api)、[Spin](https://ant-design.antgroup.com/components/spin-cn#api) 属性实现图片加载。
</docs>

<docs lang="en-US">
Can use loading,[Image](https://ant-design.antgroup.com/components/image#api),[Spin](https://ant-design.antgroup.com/components/spin#api) props.
</docs>
