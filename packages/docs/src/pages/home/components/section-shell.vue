<script setup lang="ts">
import { createStyles } from "antdv-style";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    desc?: string;
    dark?: boolean;
    clickable?: boolean;
  }>(),
  {
    desc: "",
    dark: true,
    clickable: false,
  },
);

const useStyles = createStyles(({ token, css }) => ({
  root: css`
    border-radius: 28px;
    padding: 28px 32px;
    background: ${props.dark
      ? "linear-gradient(180deg, #1e2226e6 0%, #1c2024 38%, #16191c 100%)"
      : token.colorBgContainer};
    color: ${props.dark ? "#fff" : token.colorText};
    box-shadow: ${props.dark
      ? "0 16px 48px rgba(0, 0, 0, 0.25)"
      : token.boxShadow};
    cursor: ${props.clickable ? "pointer" : "default"};
    transition:
      transform ${token.motionDurationMid},
      box-shadow ${token.motionDurationMid};

    &:hover {
      ${props.clickable
        ? "transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);"
        : ""}
    }

    @media (max-width: 900px) {
      padding: 20px 16px;
      border-radius: 20px;
    }
  `,
  title: css`
    margin: 0;
    font-size: 30px;
    line-height: 1.25;
    color: inherit;

    @media (max-width: 900px) {
      font-size: 24px;
    }
  `,
  desc: css`
    margin: 10px 0 0;
    max-width: 860px;
    font-size: 16px;
    line-height: 1.8;
    color: ${props.dark ? "rgba(255,255,255,0.68)" : token.colorTextSecondary};
  `,
  body: css`
    margin-top: 20px;
  `,
}));

const styleState = computed(() => useStyles());
</script>

<template>
  <section :class="styleState.styles.root">
    <h2 :class="styleState.styles.title">
      {{ title }}
    </h2>
    <p v-if="desc" :class="styleState.styles.desc">
      {{ desc }}
    </p>
    <div :class="styleState.styles.body">
      <slot />
    </div>
  </section>
</template>
