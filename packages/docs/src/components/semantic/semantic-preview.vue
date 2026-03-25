<script setup lang="ts">
import { InfoCircleOutlined, PushpinOutlined } from "@antdv-next/icons";
import vueLang from "@shikijs/langs/vue-html";
import darkTheme from "@shikijs/themes/vitesse-dark";
import lightTheme from "@shikijs/themes/vitesse-light";
import { theme } from "antdv-next";
import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

import Markers from "./markers.vue";

defineOptions({
  name: "SemanticPreview",
});

const props = withDefaults(
  defineProps<{
    componentName?: string;
    semantics?: SemanticItem[];
    itemsAPI?: string;
    height?: number;
    padding?: boolean;
    motion?: boolean;
  }>(),
  {
    componentName: "Component",
    semantics: () => [],
    padding: true,
    motion: false,
  },
);

const shiki = createHighlighterCoreSync({
  themes: [darkTheme, lightTheme],
  langs: [vueLang],
  engine: createJavaScriptRegexEngine(),
});

export interface SemanticItem {
  name: string;
  desc: string;
  version?: string;
}

const { t } = useLocale();
const { token } = theme.useToken();

function getSemanticCells(semanticPath: string): string[] {
  return semanticPath.split(".");
}

function getPathValue(source: Record<string, any>, path: string[]): any {
  return path.reduce<any>((acc, key) => acc?.[key], source);
}

function setPathValue(
  source: Record<string, any>,
  path: string[],
  value: unknown,
): Record<string, any> {
  const clone: Record<string, any> = { ...source };
  let current: Record<string, any> = clone;

  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      current[segment] = value;
      return;
    }

    const next = current[segment];
    current[segment] =
      next && typeof next === "object" && !Array.isArray(next)
        ? { ...next }
        : {};
    current = current[segment];
  });

  return clone;
}

function getMarkClassName(semanticKey: string): string {
  return `semantic-mark-${semanticKey}`.replace(/\./g, "-");
}

const semanticClasses = computed<Record<string, string>>(() => {
  let classes: Record<string, string> = {};

  props.semantics.forEach(semantic => {
    const pathCell = getSemanticCells(semantic.name);
    classes = setPathValue(classes, pathCell, getMarkClassName(semantic.name));
  });

  return classes;
});

const containerRef = ref<HTMLDivElement | null>(null);
const pinSemantic = ref<string | null>(null);
const hoverSemantic = ref<string | null>(null);

const mergedSemantic = computed(() => pinSemantic.value || hoverSemantic.value);

const hoveredSemanticClasses = computed(() => {
  if (!mergedSemantic.value) {
    return semanticClasses.value;
  }

  const hoverCell = getSemanticCells(mergedSemantic.value);
  const currentClassName = getPathValue(semanticClasses.value, hoverCell);
  return setPathValue(
    semanticClasses.value,
    hoverCell,
    `${currentClassName || ""} ${getMarkClassName("active")}`.trim(),
  );
});

const componentNameParser = computed(() => {
  if (!props.componentName) {
    return "";
  }

  return `a-${props.componentName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "")}`;
});

function generateHighlightCode(semanticName: string): string {
  const classes = setPathValue(
    {},
    getSemanticCells(semanticName),
    "my-classname",
  );
  const styles = setPathValue({}, getSemanticCells(semanticName), {
    color: "red",
  });

  function format(obj: object, offset = 1): string {
    const str = JSON.stringify(obj, null, 2);
    return str
      .split("\n")
      .map(line => `${"  ".repeat(offset)}${line}`)
      .join("\n")
      .trim()
      .replace(/"/g, "'")
      .replace(/'([^']+)':/g, "$1:");
  }

  let code: string;

  if (props.itemsAPI) {
    code = `
<${componentNameParser.value}
  :${props.itemsAPI}="[{
    classes: ${format(classes, 2)},
    styles: ${format(styles, 2)},
  }]"
/>`.trim();
  } else {
    code = `
<${componentNameParser.value}
  :classes="${format(classes)}"
  :styles="${format(styles)}"
/>`.trim();
  }

  return shiki.codeToHtml(code, {
    lang: "vue-html",
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  });
}

function togglePin(semanticName: string) {
  pinSemantic.value = pinSemantic.value === semanticName ? null : semanticName;
}
</script>

<template>
  <div ref="containerRef" class="semantic-preview-container">
    <a-row
      class="semantic-preview-row"
      :style="{ minHeight: height ? `${height}px` : undefined }"
    >
      <a-col
        :span="16"
        class="semantic-preview-col"
        :class="{ 'semantic-preview-col-no-padding': !padding }"
      >
        <a-config-provider :theme="{ token: { motion } }">
          <slot :classes="hoveredSemanticClasses" />
        </a-config-provider>
      </a-col>
      <a-col :span="8">
        <ul class="semantic-list">
          <li
            v-for="semantic in semantics"
            :key="semantic.name"
            class="semantic-list-item"
            @mouseenter="hoverSemantic = semantic.name"
            @mouseleave="hoverSemantic = null"
          >
            <a-flex vertical gap="small">
              <a-flex gap="small" align="center" justify="space-between">
                <a-flex gap="small" align="center">
                  <a-typography-title :level="5" :style="{ margin: 0 }">
                    {{ semantic.name }}
                  </a-typography-title>
                  <a-tag v-if="semantic.version" color="blue">
                    {{ semantic.version }}
                  </a-tag>
                </a-flex>

                <a-flex gap="small" align="center">
                  <a-button
                    size="small"
                    :type="pinSemantic === semantic.name ? 'primary' : 'text'"
                    @click="togglePin(semantic.name)"
                  >
                    <template #icon>
                      <PushpinOutlined />
                    </template>
                  </a-button>
                  <a-popover :title="t('components.semanticPreview.usage')">
                    <template #content>
                      <a-typography
                        :style="{ fontSize: '12px', minWidth: '300px' }"
                      >
                        <pre
                          dir="ltr"
                        ><code dir="ltr" v-html="generateHighlightCode(semantic.name)" /></pre>
                      </a-typography>
                    </template>
                    <a-button size="small" type="text">
                      <template #icon>
                        <InfoCircleOutlined />
                      </template>
                    </a-button>
                  </a-popover>
                </a-flex>
              </a-flex>
              <a-typography-paragraph
                :style="{ margin: 0, fontSize: `${token.fontSizeSM}px` }"
              >
                {{ semantic.desc }}
              </a-typography-paragraph>
            </a-flex>
          </li>
        </ul>
      </a-col>
    </a-row>
    <Markers
      :container-ref="containerRef"
      :target-class-name="
        mergedSemantic ? getMarkClassName(mergedSemantic) : null
      "
    />
  </div>
</template>

<style scoped>
.semantic-preview-container {
  position: relative;
  z-index: 0;
}

.semantic-preview-col {
  border-inline-end: 1px solid var(--ant-color-border-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--ant-padding-md);
  overflow: hidden;
  position: relative;
  z-index: 0;
}

.semantic-preview-col-no-padding {
  padding: 0;
}

.semantic-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.semantic-list-item {
  cursor: pointer;
  padding: var(--ant-padding-sm);
  transition: background-color var(--ant-motion-duration-fast) ease;
}

.semantic-list-item:hover {
  background-color: var(--ant-control-item-bg-hover);
}

.semantic-list-item:not(:first-of-type) {
  border-top: 1px solid var(--ant-color-border-secondary);
}
</style>
