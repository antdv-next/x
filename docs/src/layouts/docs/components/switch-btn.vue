<script setup lang="ts">
defineProps<{
  pure?: boolean
  value: 1 | 2
  tooltip1?: string
  tooltip2?: string
}>()

const emit = defineEmits<{
  click: [value: 1 | 2]
}>()
</script>

<template>
  <a-tooltip :title="value === 1 ? tooltip1 : tooltip2">
    <a-button type="text" class="ant-switch-btn" @click="emit('click', value === 1 ? 2 : 1)">
      <div class="btn-inner">
        <template v-if="pure">
          <template v-if="value === 1">
            <slot name="label1" />
          </template>
          <template v-else>
            <slot name="label2" />
          </template>
        </template>
        <template v-else>
          <div class="inner-div">
            <span class="label-style" :class="value === 1 ? 'label1-style' : 'label2-style'">
              <slot name="label1" />
            </span>
            <span class="label-style" :class="value === 1 ? 'label2-style' : 'label1-style'">
              <slot name="label2" />
            </span>
          </div>
        </template>
      </div>
    </a-button>
  </a-tooltip>
</template>

<style scoped>
.ant-switch-btn {
  --base-size: 1.2em;
  @apply w-[var(--ant-control-height)];

  .btn-inner {
    display: flex;
    transition: all 0.3s;
  }

  img {
    width: var(--base-size);
    height: var(--base-size);
  }

  .inner-div {
    position: relative;
    width: var(--base-size);
    height: var(--base-size);
  }

  .label-style {
    position: absolute;
    font-size: var(--base-size);
    line-height: 1;
    @apply border-1 border-solid a-border-text a-color-text;
  }

  .label1-style {
    inset-inline-start: -5%;
    top: 0;
    z-index: 1;
    transform: scale(0.7);
    transform-origin: 0 0;
    @apply a-bg-text a-color-container;
  }

  .label2-style {
    inset-inline-end: -5%;
    bottom: 0;
    z-index: 0;
    transform: scale(0.5);
    transform-origin: 100% 100%;
  }
}
</style>
