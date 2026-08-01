<script setup lang="ts">
import type { Component, CSSProperties } from "vue";

import { CheckOutlined, CodeOutlined, CopyOutlined } from "@antdv-next/icons";
import { useClipboard } from "@vueuse/core";
import { createStyles } from "antdv-style";
import { loadDemo } from "virtual:demos";
import { computed, defineAsyncComponent, shallowRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getDemoId } from "@/utils/get-demo-id";

import ExpandIcon from "./demo-expand-icon.vue";
import DemoSkeleton from "./demo-skeleton.vue";
import { loadPlaygroundUrl } from "./playground";

defineOptions({
  name: "Demo",
});

const props = withDefaults(
  defineProps<{
    src: string;
    background?: string;
    simplify?: boolean;
  }>(),
  {
    background: "",
    simplify: false,
  },
);

const useStyles = createStyles(({ token }) => ({
  root: {
    breakInside: "avoid",
    display: "flow-root",
    overflow: "hidden",
    position: "relative",
    boxSizing: "border-box",
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
    margin: "16px 0",
    "&.border-primary": {
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 3px color-mix(in srgb, ${token.colorPrimary} 12%, transparent)`,
    },
    "& .ant-doc-demo-box-demo": {
      padding: "24px",
      borderBottom: `1px solid ${token.colorSplit}`,
      borderRadius: "8px 8px 0 0",
      background: token.colorBgContainer,
    },
    "& .ant-doc-demo-box-skeleton": {
      minHeight: 160,
    },
    "&.ant-doc-demo-box-simplify": {
      borderRadius: 0,
      background: "transparent",
    },
    "&.ant-doc-demo-box-simplify .ant-doc-demo-box-demo": {
      padding: 0,
      borderBottom: 0,
      background: "transparent",
    },
    "& .ant-doc-demo-box-meta.markdown": {
      position: "relative",
      width: "100%",
      fontSize: 14,
      borderRadius: "0 0 6px 6px",
      transition: "background-color 0.4s",
    },
    "& .ant-doc-demo-box-meta-description": {
      padding: "18px 24px 24px",
    },
    "& .ant-doc-demo-box-meta-description p": {
      margin: 0,
    },
    "& .ant-doc-demo-box-title": {
      position: "absolute",
      top: -16,
      marginLeft: 16,
      padding: "1px 8px",
      borderRadius: "6px 6px 0 0",
      backgroundColor: token.colorBgContainer,
      transition: "background-color 0.4s",
    },
    "& .ant-doc-demo-box-title a": {
      color: token.colorText,
      textDecoration: "none",
      fontSize: 16,
      fontWeight: 500,
    },
    "& .ant-doc-demo-box-actions": {
      display: "flex",
      justifyContent: "center",
      padding: "12px 0",
      borderTop: `1px dashed ${token.colorSplit}`,
      opacity: 0.7,
      transition: "opacity 0.3s",
    },
    "&:hover .ant-doc-demo-box-actions": {
      opacity: 1,
    },
    "& .ant-doc-demo-box-code-action": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      border: 0,
      padding: 0,
      background: "transparent",
      color: token.colorTextSecondary,
      cursor: "pointer",
      transition: "color 0.24s ease",
    },
    "& .ant-doc-demo-box-code-action:hover": {
      color: token.colorPrimary,
    },
    "& .ant-doc-demo-box-code": {
      position: "relative",
      lineHeight: 2,
      padding: `${token.paddingSM}px ${token.padding}px`,
    },
    "& .ant-doc-demo-box-code-tabs": {
      borderTop: `1px dashed ${token.colorSplit}`,
    },
    "& .ant-doc-demo-box-code-tabs .ant-tabs-nav": {
      marginBottom: 0,
    },
    "& .ant-doc-demo-box-code-tabs .ant-tabs-tab": {
      fontSize: 12,
    },
    "& .ant-doc-demo-box-code-copy": {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      border: 0,
      padding: 0,
      background: "transparent",
      color: token.colorIcon,
      cursor: "pointer",
    },
    "& .ant-doc-demo-box-code-copied": {
      color: token.colorSuccess,
    },
    "& .ant-doc-demo-box-code .language-vue, & .ant-doc-demo-box-code .language-js, & .ant-doc-demo-box-code .language-ts":
      {
        margin: 0,
        borderRadius: 0,
      },
    "& .ant-doc-demo-box-code pre": {
      margin: 0,
    },
  },
}));

const route = useRoute();
const router = useRouter();
const showCode = shallowRef(false);
const codeType = shallowRef<string>("ts");
const demo = shallowRef<any>(null);
const sourceData = shallowRef<any>(null);
const sourceLoading = shallowRef(false);
const sourceLoadError = shallowRef<Error | null>(null);
const demoLoading = shallowRef(true);
let demoLoadVersion = 0;
let sourceLoadPromise: Promise<void> | null = null;

async function ensureSourceLoaded() {
  if (sourceData.value || !demo.value) return;
  if (sourceLoadPromise) return sourceLoadPromise;

  const currentDemo = demo.value;
  sourceLoading.value = true;
  sourceLoadError.value = null;

  const request = Promise.resolve(
    currentDemo.loadSource ? currentDemo.loadSource() : currentDemo,
  )
    .then(data => {
      if (demo.value === currentDemo) sourceData.value = data;
    })
    .catch(error => {
      const loadError =
        error instanceof Error ? error : new Error(String(error));
      if (demo.value === currentDemo) sourceLoadError.value = loadError;
      throw loadError;
    })
    .finally(() => {
      if (sourceLoadPromise === request) {
        sourceLoadPromise = null;
        sourceLoading.value = false;
      }
    });

  sourceLoadPromise = request;
  return request;
}

watch(
  demo,
  () => {
    sourceData.value = null;
    sourceLoadError.value = null;
    sourceLoadPromise = null;
    sourceLoading.value = false;
  },
  { flush: "sync" },
);

watch([showCode, demo], ([visible, currentDemo]) => {
  if (visible && currentDemo) void ensureSourceLoaded().catch(() => {});
});

watch(
  () => props.src,
  async src => {
    const currentLoadVersion = ++demoLoadVersion;
    demoLoading.value = true;
    demo.value = null;

    try {
      const loadedDemo = await loadDemo(src);
      if (currentLoadVersion !== demoLoadVersion) return;
      demo.value = loadedDemo;
    } finally {
      if (currentLoadVersion === demoLoadVersion) {
        demoLoading.value = false;
      }
    }
  },
  { immediate: true },
);

const preferredLocale = computed(() => {
  return route.meta?.locale === "en-US" ? "en-US" : "zh-CN";
});

const description = computed(() => {
  const locales = demo.value?.locales ?? {};
  return (
    locales[preferredLocale.value]?.html ||
    locales["zh-CN"]?.html ||
    locales["en-US"]?.html ||
    Reflect.get(Object.values(locales)[0] || {}, "html") ||
    ""
  );
});

const component = computed<Component | undefined>(() => {
  if (typeof demo.value?.component === "function")
    return defineAsyncComponent(
      demo.value.component as () => Promise<Component>,
    );
  return demo.value?.component as Component | undefined;
});

const id = computed(() => getDemoId(props.src));
const hasJsSource = computed(() => Boolean(sourceData.value?.jsSource?.trim()));
const extraFiles = computed<
  { name: string; lang: string; code: string; html: string }[]
>(() => sourceData.value?.extraFiles ?? []);
const hasExtraFiles = computed(() => extraFiles.value.length > 0);
const hasCodeTabs = computed(() => hasJsSource.value || hasExtraFiles.value);
const codeTabKeys = computed(() => {
  const keys: string[] = ["ts"];
  if (hasJsSource.value) keys.push("js");
  for (const file of extraFiles.value) keys.push(file.name);
  return keys;
});
const activeCodeType = computed<string>({
  get() {
    if (codeTabKeys.value.includes(codeType.value)) return codeType.value;
    return "ts";
  },
  set(value) {
    codeType.value = value;
  },
});
const activeExtraFile = computed(() =>
  extraFiles.value.find(file => file.name === activeCodeType.value),
);
const sourceCode = computed(() => {
  if (activeExtraFile.value) return activeExtraFile.value.code;
  if (activeCodeType.value === "js")
    return sourceData.value?.jsSource || sourceData.value?.source || "";
  return sourceData.value?.source || "";
});
const sourceHtml = computed(() => {
  if (activeExtraFile.value) return activeExtraFile.value.html;
  if (activeCodeType.value === "js")
    return sourceData.value?.jsHtml || sourceData.value?.html || "";
  return sourceData.value?.html || "";
});

const { copied, copy } = useClipboard({
  source: sourceCode,
  legacy: true,
});
const styleState = useStyles();

const isActive = computed(() => route.hash === `#${id.value}`);
const demoStyle = computed<CSSProperties>(() => {
  const inlineStyle: CSSProperties = {};
  if (props.background === "grey")
    inlineStyle.backgroundColor = styleState.theme.colorBgLayout;
  return inlineStyle;
});
const cls = computed(() => ({
  "border-primary": isActive.value,
  "ant-doc-demo-box-simplify": props.simplify,
}));

function toggleCode() {
  showCode.value = !showCode.value;
}

function navigateToAnchor(event: MouseEvent) {
  event.preventDefault();
  router.push({
    path: route.path,
    hash: `#${id.value}`,
  });
}

async function copySource() {
  try {
    await ensureSourceLoaded();
    await copy();
  } catch {
    showCode.value = true;
  }
}

async function openPlayground() {
  const playgroundWindow = window.open("about:blank", "_blank");
  if (playgroundWindow) playgroundWindow.opener = null;

  try {
    await ensureSourceLoaded();
    const url = loadPlaygroundUrl(sourceData.value?.source || "");
    if (playgroundWindow) playgroundWindow.location.replace(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    playgroundWindow?.close();
    showCode.value = true;
  }
}
</script>

<template>
  <section
    :id="id"
    class="ant-doc-demo-box border-solid border-color-split border-1px"
    :class="[styleState.styles.root, cls]"
  >
    <template v-if="simplify">
      <section class="vp-raw ant-doc-demo-box-demo" :style="demoStyle">
        <DemoSkeleton v-if="demoLoading" simplify />
        <Suspense v-else-if="component">
          <component :is="component" />
          <template #fallback>
            <DemoSkeleton simplify />
          </template>
        </Suspense>
      </section>
    </template>
    <template v-else>
      <section class="vp-raw ant-doc-demo-box-demo" :style="demoStyle">
        <DemoSkeleton v-if="demoLoading" />
        <Suspense v-else-if="component">
          <component :is="component" />
          <template #fallback>
            <DemoSkeleton />
          </template>
        </Suspense>
      </section>

      <section class="ant-doc-demo-box-meta markdown">
        <div class="ant-doc-demo-box-title">
          <a :href="`#${id}`" @click="navigateToAnchor">
            <slot />
          </a>
        </div>
        <div v-if="description" class="ant-doc-demo-box-meta-description">
          <div v-html="description" />
        </div>
        <a-flex
          class="ant-doc-demo-box-actions"
          wrap
          gap="middle"
          justify="center"
        >
          <a-tooltip :title="copied ? '已复制' : '复制代码'">
            <button
              class="ant-doc-demo-box-code-action"
              type="button"
              @click="copySource"
            >
              <CheckOutlined v-if="copied" />
              <CopyOutlined v-else />
            </button>
          </a-tooltip>
          <a-tooltip title="在 Playground 中打开">
            <button
              class="ant-doc-demo-box-code-action"
              type="button"
              @click="openPlayground"
            >
              <CodeOutlined />
            </button>
          </a-tooltip>
          <a-tooltip :title="showCode ? '收起代码' : '展开代码'">
            <button
              class="ant-doc-demo-box-expand-icon ant-doc-demo-box-code-action"
              type="button"
              @click="toggleCode"
            >
              <ExpandIcon :expanded="showCode" />
            </button>
          </a-tooltip>
        </a-flex>
      </section>

      <template v-if="showCode">
        <div v-if="hasCodeTabs" class="ant-doc-demo-box-code-tabs">
          <a-tabs v-model:active-key="activeCodeType" centered size="small">
            <a-tab-pane key="ts" tab="TypeScript" />
            <a-tab-pane v-if="hasJsSource" key="js" tab="JavaScript" />
            <a-tab-pane
              v-for="file in extraFiles"
              :key="file.name"
              :tab="file.name"
            />
          </a-tabs>
        </div>
        <div v-if="sourceLoading" class="ant-doc-demo-box-code">
          <a-spin />
        </div>
        <div v-else-if="sourceLoadError" class="ant-doc-demo-box-code">
          <a-alert
            type="error"
            :message="
              preferredLocale === 'en-US'
                ? 'Failed to load source code'
                : '源码加载失败'
            "
          />
        </div>
        <div v-else class="ant-doc-demo-box-code">
          <a-tooltip :title="copied ? '已复制' : '复制代码'">
            <button
              class="ant-doc-demo-box-code-copy"
              :class="{ 'ant-doc-demo-box-code-copied': copied }"
              type="button"
              @click="copySource"
            >
              <CopyOutlined v-if="!copied" />
              <CheckOutlined v-else />
            </button>
          </a-tooltip>
          <div v-html="sourceHtml" />
        </div>
      </template>
    </template>
  </section>
</template>
