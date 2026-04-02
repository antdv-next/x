<script setup lang="ts">
defineOptions({
  name: "DemoSkeleton",
});

withDefaults(
  defineProps<{
    simplify?: boolean;
  }>(),
  {
    simplify: false,
  },
);
</script>

<template>
  <div class="ant-doc-demo-box-skeleton">
    <a-skeleton
      active
      :title="{ width: simplify ? '38%' : '24%' }"
      :paragraph="{
        rows: simplify ? 3 : 5,
        width: simplify
          ? ['100%', '88%', '72%']
          : ['100%', '86%', '94%', '74%', '58%'],
      }"
    />
  </div>
</template>
