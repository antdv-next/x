<script setup lang="ts">
import { createStyles } from "antdv-style";

defineProps<{
  pure?: boolean;
  value: 1 | 2;
  tooltip1?: string;
  tooltip2?: string;
}>();

const emit = defineEmits<{
  click: [value: 1 | 2];
}>();

const useStyles = createStyles(({ token }) => ({
  switchBtn: {
    "--base-size": "1.2em",
    width: token.controlHeight,
    ".btn-inner": {
      display: "flex",
      transition: "all 0.3s",
    },
    img: {
      width: "var(--base-size)",
      height: "var(--base-size)",
    },
    ".inner-div": {
      position: "relative",
      width: "var(--base-size)",
      height: "var(--base-size)",
    },
    ".label-style": {
      position: "absolute",
      fontSize: "var(--base-size)",
      lineHeight: 1,
      border: `1px solid ${token.colorText}`,
      color: token.colorText,
    },
    ".label1-style": {
      insetInlineStart: "-5%",
      top: 0,
      zIndex: 1,
      transform: "scale(0.7)",
      transformOrigin: "0 0",
      background: token.colorText,
      color: token.colorBgContainer,
    },
    ".label2-style": {
      insetInlineEnd: "-5%",
      bottom: 0,
      zIndex: 0,
      transform: "scale(0.5)",
      transformOrigin: "100% 100%",
    },
  },
}));

const styleState = useStyles();
</script>

<template>
  <a-tooltip :title="value === 1 ? tooltip1 : tooltip2">
    <a-button
      type="text"
      :class="styleState.styles.switchBtn"
      @click="emit('click', value === 1 ? 2 : 1)"
    >
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
            <span
              class="label-style"
              :class="value === 1 ? 'label1-style' : 'label2-style'"
            >
              <slot name="label1" />
            </span>
            <span
              class="label-style"
              :class="value === 1 ? 'label2-style' : 'label1-style'"
            >
              <slot name="label2" />
            </span>
          </div>
        </template>
      </div>
    </a-button>
  </a-tooltip>
</template>
