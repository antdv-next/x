<script setup lang="ts">
defineOptions({
  name: "DemoSkeleton",
});

withDefaults(
  defineProps<{
    compact?: boolean;
    simplify?: boolean;
  }>(),
  {
    compact: false,
    simplify: false,
  },
);
</script>

<template>
  <div
    class="ant-doc-demo-box-skeleton"
    :class="{
      'ant-doc-demo-box-skeleton-compact': compact || simplify,
    }"
  >
    <a-skeleton
      active
      :title="{ width: compact || simplify ? '38%' : '24%' }"
      :paragraph="{
        rows: compact || simplify ? 3 : 5,
        width:
          compact || simplify
            ? ['100%', '88%', '72%']
            : ['100%', '86%', '94%', '74%', '58%'],
      }"
    />
  </div>
</template>
