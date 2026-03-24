<script setup lang="ts">
interface Props {
  content?: string;
}

withDefaults(defineProps<Props>(), {
  content: "▋",
});
</script>

<template>
  <span class="xmd-tail">
    {{ content }}
  </span>
</template>

<style scoped>
.xmd-tail {
  color: inherit;
  font-size: inherit;
  line-height: inherit;
}
</style>
