<script setup lang="ts">
import { iconWrap } from "./common";

defineOptions({ name: "NpmLogo" });
</script>

<template>
  <span :style="iconWrap">
    <svg
      fill="#E53E3E"
      focusable="false"
      height="1em"
      stroke="#E53E3E"
      stroke-width="0"
      viewBox="0 0 16 16"
      width="1em"
    >
      <title>npm icon</title>
      <path d="M0 0v16h16v-16h-16zM13 13h-2v-8h-3v8h-5v-10h10v10z" />
    </svg>
  </span>
</template>
