<script setup lang="ts">
import type { Id } from "flexsearch";
import type { RouteLocationRaw } from "vue-router";

import {
  AppstoreOutlined,
  FileTextOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@antdv-next/icons";
import { onClickOutside, useDebounceFn } from "@vueuse/core";
import { createStyles } from "antdv-style";
import { Charset, Document } from "flexsearch";
import { storeToRefs } from "pinia";
import { computed, markRaw, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useLocale } from "@/composables/use-locale";
import { useAppStore } from "@/stores/app";

type Locale = "en-US" | "zh-CN";

interface SearchIndexMeta {
  locale: Locale;
  count: number;
  generatedAt: string;
}

interface SearchIndexPayload {
  meta: SearchIndexMeta;
  index: Record<string, string>;
}

interface SearchStoreDoc {
  title: string;
  description: string;
  path: string;
  headers: string[];
  section: string;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | Array<string | number | boolean | null>;
}

type SearchDocument = SearchStoreDoc & {
  id: Id;
  content: string;
};

type SearchResultItem = SearchStoreDoc & {
  id: Id;
  score: number;
};

const appStore = useAppStore();
const { locale } = storeToRefs(appStore);
const router = useRouter();
const route = useRoute();
const { t } = useLocale();

const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const searchValue = ref("");
const expanded = ref(false);
const open = ref(false);
const loading = ref(false);
const results = ref<SearchResultItem[]>([]);
const activeIndex = ref(-1);
const itemRefs = ref<Array<HTMLElement | null>>([]);
const indexCache = new Map<Locale, Document<SearchDocument>>();
const indexLoading = new Map<Locale, Promise<Document<SearchDocument>>>();

const sectionIcons = {
  components: AppstoreOutlined,
  docs: FileTextOutlined,
  blog: ProfileOutlined,
};

function resolveSectionIcon(section: string) {
  return sectionIcons[section as keyof typeof sectionIcons] ?? FileTextOutlined;
}

function sanitizeText(value: string) {
  return value.replace(/\{#[^}]+\}/g, "").trim();
}

function normalizeForMatch(value: string) {
  return sanitizeText(value).toLowerCase();
}

function normalizeSlugMatch(value: string) {
  return normalizeForMatch(value).replace(/[\s-_]+/g, "");
}

function countMatches(text: string, tokens: string[]) {
  const haystack = normalizeForMatch(text);
  if (!haystack) return 0;
  let count = 0;
  for (const token of tokens) {
    const needle = token.toLowerCase();
    if (!needle) continue;
    let index = 0;
    while (true) {
      index = haystack.indexOf(needle, index);
      if (index === -1) break;
      count += 1;
      index += needle.length || 1;
    }
  }
  return count;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightParts(text: string, query: string) {
  const cleaned = sanitizeText(text);
  if (!cleaned) return [];
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [{ text: cleaned, highlight: false }];
  const pattern = tokens.map(escapeRegExp).join("|");
  if (!pattern) return [{ text: cleaned, highlight: false }];
  const regex = new RegExp(pattern, "gi");
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: cleaned.slice(lastIndex, match.index),
        highlight: false,
      });
    }
    parts.push({
      text: match[0],
      highlight: true,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < cleaned.length) {
    parts.push({
      text: cleaned.slice(lastIndex),
      highlight: false,
    });
  }

  return parts.length ? parts : [{ text: cleaned, highlight: false }];
}

const groupedResults = computed(() => {
  const groups = new Map<string, SearchResultItem[]>();
  for (const item of results.value) {
    const key = item.section || "docs";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }

  const order = ["components", "docs", "blog"];
  const grouped = Array.from(groups.entries()).map(([key, items]) => ({
    key,
    title: t(`ui.docSearch.sections.${key}`) || key,
    items,
  }));

  return grouped.sort((a, b) => {
    const aIndex = order.indexOf(a.key);
    const bIndex = order.indexOf(b.key);
    if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
});

const flatResults = computed(() => {
  return groupedResults.value.flatMap(group => group.items);
});

function getItemIndex(item: SearchResultItem) {
  return flatResults.value.findIndex(value => value.id === item.id);
}

function setActiveIndex(nextIndex: number) {
  if (!flatResults.value.length) {
    activeIndex.value = -1;
    return;
  }
  const max = flatResults.value.length - 1;
  if (nextIndex < 0) activeIndex.value = max;
  else if (nextIndex > max) activeIndex.value = 0;
  else activeIndex.value = nextIndex;
}

function setItemRef(element: Element | null, index: number) {
  if (index < 0) return;
  itemRefs.value[index] = element as HTMLElement | null;
}

async function scrollActiveIntoView() {
  if (!open.value) return;
  const current = activeIndex.value;
  if (current < 0) return;
  await nextTick();
  const element = itemRefs.value[current];
  if (element) {
    element.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
  }
}

function createIndex(targetLocale: Locale) {
  return new Document<SearchDocument>({
    tokenize: targetLocale === "zh-CN" ? "full" : "forward",
    encoder: targetLocale === "zh-CN" ? Charset.CJK : Charset.Default,
    cache: 100,
    document: {
      id: "id",
      index: ["title", "content", "headers"],
      store: ["title", "description", "path", "headers", "section"],
    },
  });
}

async function loadIndexData(targetLocale: Locale) {
  const fileUrl =
    targetLocale === "zh-CN" ? "/search.cn.json" : "/search.en.json";
  const response = await fetch(fileUrl);
  if (!response.ok)
    throw new Error(`Failed to load ${targetLocale} search index`);
  return (await response.json()) as SearchIndexPayload;
}

async function ensureIndex(targetLocale: Locale) {
  const cached = indexCache.get(targetLocale);
  if (cached) return cached;

  const loadingPromise = indexLoading.get(targetLocale);
  if (loadingPromise) return loadingPromise;

  const promise = (async () => {
    const payload = await loadIndexData(targetLocale);
    const index = markRaw(createIndex(targetLocale));
    for (const [key, data] of Object.entries(payload.index))
      index.import(key, data);

    indexCache.set(targetLocale, index);
    indexLoading.delete(targetLocale);
    return index;
  })();

  indexLoading.set(targetLocale, promise);
  return promise;
}

function collapse() {
  expanded.value = false;
  open.value = false;
  results.value = [];
  searchValue.value = "";
  activeIndex.value = -1;
}

function clearResults() {
  results.value = [];
  open.value = false;
}

function handleExpand() {
  expanded.value = true;
  void nextTick(() => {
    inputRef.value?.focus();
  });
  void ensureIndex(locale.value as Locale);
}

const runSearch = useDebounceFn(async (query: string) => {
  const currentQuery = query.trim();
  if (!currentQuery) {
    clearResults();
    return;
  }

  const tokens = currentQuery.split(/\s+/).filter(Boolean);
  const querySlug = normalizeSlugMatch(currentQuery);

  open.value = true;
  loading.value = true;
  results.value = [];
  const targetLocale = locale.value as Locale;
  try {
    const index = await ensureIndex(targetLocale);

    if (searchValue.value.trim() !== currentQuery) return;

    const raw = index.search(currentQuery, {
      enrich: true,
      limit: 12,
      suggest: true,
    }) as Array<{
      field: string;
      result: Array<{ id: Id; doc: SearchStoreDoc }>;
    }>;

    const scored = new Map<Id, SearchResultItem>();
    const weights: Record<string, number> = {
      title: 4,
      headers: 3,
      content: 1,
    };

    for (const group of raw) {
      const weight = weights[group.field] ?? 1;
      for (const item of group.result) {
        const doc = item.doc;
        if (!doc) continue;
        const basePath = doc.path.split("#")[0]!;
        const componentSlug = basePath.startsWith("/components/")
          ? basePath
              .replace("/components/", "")
              .replace(/-cn$/, "")
              .replace(/-en$/, "")
          : "";
        const isComponent = doc.section === "components";
        const isComponentDoc = isComponent && basePath === doc.path;
        const normalizedComponent = componentSlug
          ? normalizeSlugMatch(componentSlug)
          : "";
        const exactComponentMatch =
          querySlug && normalizedComponent && normalizedComponent === querySlug;
        const partialComponentMatch =
          querySlug &&
          normalizedComponent &&
          normalizedComponent.includes(querySlug);
        const titleMatches = countMatches(doc.title, tokens);
        const descMatches = countMatches(doc.description ?? "", tokens);
        const headerMatches = (doc.headers || []).reduce(
          (acc, header) => acc + countMatches(header, tokens),
          0,
        );
        const matchScore =
          titleMatches * 6 + headerMatches * 3 + descMatches * 2;
        const sectionBoost = isComponent ? 10 : 0;
        const exactBoost = exactComponentMatch ? 40 : 0;
        const partialBoost = partialComponentMatch ? 10 : 0;
        const baseDocBoost = isComponentDoc ? 8 : -2;
        const finalScore =
          weight +
          matchScore +
          sectionBoost +
          exactBoost +
          partialBoost +
          baseDocBoost;
        const current = scored.get(item.id);
        if (current) {
          current.score += weight + matchScore;
        } else {
          scored.set(item.id, {
            id: item.id,
            title: doc.title,
            description: doc.description ?? "",
            path: doc.path,
            headers: doc.headers,
            section: doc.section,
            score: finalScore,
          });
        }
      }
    }

    results.value = Array.from(scored.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    open.value = true;
  } catch (error) {
    console.error("[doc-search] Failed to search", error);
    clearResults();
  } finally {
    loading.value = false;
  }
}, 200);

function handleInput(value: string) {
  searchValue.value = value;
  runSearch(value);
}

function handleFocus() {
  if (searchValue.value.trim() && results.value.length) open.value = true;
  void ensureIndex(locale.value as Locale);
}

function handleSelect(item: SearchResultItem) {
  const target: RouteLocationRaw = { path: item.path };
  router.push(target);
  collapse();
}

function handleKeydown(event: KeyboardEvent) {
  if (!expanded.value) return;
  if (event.key === "Escape") {
    if (open.value) {
      open.value = false;
    } else {
      collapse();
    }
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!open.value) open.value = true;
    setActiveIndex(activeIndex.value + 1);
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!open.value) open.value = true;
    setActiveIndex(activeIndex.value - 1);
    return;
  }
  if (event.key === "Enter") {
    if (activeIndex.value >= 0 && flatResults.value[activeIndex.value]) {
      handleSelect(flatResults.value[activeIndex.value]!);
    }
  }
}

onClickOutside(wrapperRef, () => {
  if (!expanded.value) return;
  if (searchValue.value.trim()) {
    open.value = false;
  } else {
    collapse();
  }
});

watch(locale, () => {
  if (searchValue.value.trim()) runSearch(searchValue.value);
  else clearResults();
});

watch(results, () => {
  if (results.value.length) {
    activeIndex.value = 0;
  } else {
    activeIndex.value = -1;
  }
  itemRefs.value = [];
});

watch(activeIndex, () => {
  void scrollActiveIntoView();
});

watch(open, value => {
  if (value) void scrollActiveIntoView();
});

watch(
  () => route.fullPath,
  () => {
    collapse();
  },
);

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    min-width: 0;
  `,
  inner: css`
    position: relative;
    display: flex;
    align-items: center;
    height: 28px;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition:
      width 0.25s ease,
      background 0.25s ease;
    width: 28px;
    background: transparent;
  `,
  innerExpanded: css`
    width: 160px;
    background: ${token.colorBgElevated};
    cursor: text;
  `,
  svg: css`
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    margin-inline-start: 7px;
    color: ${token.colorText};
    pointer-events: none;
  `,
  input: css`
    flex: 1;
    min-width: 0;
    height: 28px;
    border: 0;
    padding: 0 8px 0 6px;
    font-size: 13px;
    box-sizing: border-box;
    outline: none;
    color: ${token.colorText};
    background: transparent;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;

    &::placeholder {
      color: ${token.colorTextQuaternary};
    }
  `,
  inputVisible: css`
    opacity: 1;
    pointer-events: auto;
  `,
  panel: css`
    position: absolute;
    top: calc(100% + 15px);
    inset-inline-start: 0;
    width: 520px;
    max-width: calc(100vw - 64px);
    max-height: 420px;
    overflow: auto;
    border-radius: 12px;
    background: ${token.colorBgElevated};
    box-shadow: ${token.boxShadowSecondary};
    border: 1px solid ${token.colorSplit};
    padding: 8px;
    z-index: 1001;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${token.colorTextQuaternary};
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  `,
  panelState: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    color: ${token.colorTextSecondary};
    font-size: 12px;
  `,
  panelList: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  groupTitle: css`
    font-size: 12px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
    padding: 4px 8px;
  `,
  groupList: css`
    list-style: none;
    margin: 0;
    padding: 0;
  `,
  item: css`
    padding: 12px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;

    &:hover,
    &.is-active {
      background: ${token.colorFillTertiary};
    }

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      inset-inline-start: 48px;
      inset-inline-end: 8px;
      bottom: 0;
      border-bottom: 1px dashed ${token.colorSplit};
    }
  `,
  itemInner: css`
    display: flex;
    gap: 12px;
    align-items: center;
  `,
  itemIcon: css`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${token.colorTextSecondary};
    background: ${token.colorFillQuaternary};
    flex-shrink: 0;
  `,
  itemContent: css`
    flex: 1;
    min-width: 0;
  `,
  itemTitle: css`
    font-size: 14px;
    font-weight: 600;
    color: ${token.colorText};
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  itemDesc: css`
    margin-top: 6px;
    font-size: 12px;
    color: ${token.colorTextSecondary};
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
  highlight: css`
    background: ${token.colorWarningBg};
    border-radius: 2px;
    padding: 0 2px;
  `,
  mobilePanel: css`
    @media (max-width: 767.99px) {
      position: fixed;
      inset-inline: 8px;
      top: calc(var(--ant-doc-header-height) + 8px);
      width: auto;
      max-width: none;
      max-height: calc(100vh - var(--ant-doc-header-height) - 24px);
    }
  `,
}));

const styleState = useStyles();
</script>

<template>
  <div ref="wrapperRef" :class="styleState.styles.container">
    <div
      :class="[
        styleState.styles.inner,
        expanded && styleState.styles.innerExpanded,
      ]"
      @click="!expanded && handleExpand()"
    >
      <SearchOutlined :class="styleState.styles.svg" />
      <input
        ref="inputRef"
        :value="searchValue"
        :class="[
          styleState.styles.input,
          expanded && styleState.styles.inputVisible,
        ]"
        :placeholder="t('ui.docSearch.placeholder')"
        @input="handleInput(($event.target as HTMLInputElement).value)"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
    </div>
    <div
      v-if="expanded && open"
      :class="[styleState.styles.panel, styleState.styles.mobilePanel]"
    >
      <div v-if="loading" :class="styleState.styles.panelState">
        <a-spin size="small" />
        <span>{{ t("ui.docSearch.loadingText") }}</span>
      </div>
      <div v-else-if="!results.length" :class="styleState.styles.panelState">
        <span>{{ t("ui.docSearch.emptyText") }}</span>
      </div>
      <div v-else :class="styleState.styles.panelList">
        <div v-for="group in groupedResults" :key="group.key">
          <div :class="styleState.styles.groupTitle">
            {{ group.title }}
          </div>
          <ul :class="styleState.styles.groupList">
            <li
              v-for="item in group.items"
              :key="String(item.id)"
              :ref="el => setItemRef(el as any, getItemIndex(item))"
              :class="[
                styleState.styles.item,
                { 'is-active': activeIndex === getItemIndex(item) },
              ]"
              @click="handleSelect(item)"
              @mouseenter="setActiveIndex(getItemIndex(item))"
            >
              <div :class="styleState.styles.itemInner">
                <div :class="styleState.styles.itemIcon">
                  <component :is="resolveSectionIcon(item.section)" />
                </div>
                <div :class="styleState.styles.itemContent">
                  <div :class="styleState.styles.itemTitle">
                    <span
                      v-for="(part, index) in getHighlightParts(
                        item.title,
                        searchValue,
                      )"
                      :key="index"
                      :class="part.highlight ? styleState.styles.highlight : ''"
                      >{{ part.text }}</span
                    >
                  </div>
                  <div
                    v-if="item.description"
                    :class="styleState.styles.itemDesc"
                  >
                    <span
                      v-for="(part, index) in getHighlightParts(
                        item.description,
                        searchValue,
                      )"
                      :key="index"
                      :class="part.highlight ? styleState.styles.highlight : ''"
                      >{{ part.text }}</span
                    >
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
