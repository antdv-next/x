<script setup lang="ts">
import { DownloadOutlined, EyeOutlined } from "@antdv-next/icons";
import { FileCard } from "@antdv-next/x";
import { h } from "vue";
</script>

<template>
  <div style="display: flex; gap: 16px; flex-wrap: wrap">
    <FileCard
      name="example-document.pdf"
      :byte="1024000"
      description="这是一个PDF文档"
      :mask="
        h('div', { style: { display: 'flex', gap: '8px' } }, [
          h(EyeOutlined),
          h(DownloadOutlined),
        ])
      "
    />

    <FileCard
      name="image.jpg"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      type="image"
      :image-props="{
        preview: {
          mask: h(
            'div',
            { style: { display: 'flex', gap: '8px', color: '#fff' } },
            [h('span', '预览'), h('span', '下载')],
          ),
        },
      }"
    />

    <FileCard
      name="video.mp4"
      src="https://www.w3schools.com/html/mov_bbb.mp4"
      type="video"
      :mask="
        info =>
          h('div', [
            h('div', '播放视频'),
            h('div', { style: { fontSize: '12px', opacity: 0.8 } }, info.name),
          ])
      "
    />
  </div>
</template>

<docs lang="zh-CN">
自定义遮罩。
</docs>

<docs lang="en-US">
Custom mask.
</docs>
