<script setup lang="ts">
import { FileCard } from "@antdv-next/x";
import { Flex } from "antdv-next";
</script>

<template>
  <Flex vertical gap="middle">
    <FileCard name="excel-has-long-long-long-name.xlsx" :byte="1024" />
    <FileCard name="word-file.docx" :byte="1024" />
    <FileCard name="pdf-file.pdf" :byte="1024" />
    <FileCard name="ppt-file.pptx" :byte="1024" />
    <FileCard name="zip-file.zip" :byte="1024" />
    <FileCard name="txt-file.txt" :byte="1024" />
    <FileCard name="markdown-file.md" :byte="1024" />
    <FileCard name="java-file.java" :byte="1024" />
    <FileCard name="javascript-file.js" :byte="1024" />
    <FileCard name="python-file.py" :byte="1024" />
    <FileCard
      :styles="{ file: { width: 350 } }"
      name="excel-file.xlsx"
      :byte="1024"
    />
  </Flex>
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
