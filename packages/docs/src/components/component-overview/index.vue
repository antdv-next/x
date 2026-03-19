<script setup lang="ts">
import { SearchOutlined } from "@antdv-next/icons";
import { createStyles } from "antdv-style";
import { computed, ref } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

import type { ComponentOverviewItem, OverviewLocale } from "./data";

import { componentOverviewItems } from "./data";

defineOptions({ name: "ComponentOverview" });

interface OverviewGroup {
  key: string;
  label: string;
  order: number;
  items: ComponentOverviewItem[];
}

const useStyles = createStyles(({ token }) => ({
  root: {
    width: "100%",
    ".component-overview-search-affix": {
      padding: "4px 0",
      transition: `all ${token.motionDurationMid}`,
    },
    ".component-overview-search-affix.is-affixed": {
      padding: 12,
      borderRadius: 10,
      background: token.colorBgElevated,
      boxShadow: token.boxShadowSecondary,
    },
    ".component-overview-search-input": {
      width: "100%",
      fontSize: 18,
      paddingInline: 0,
    },
    ".component-overview-search-input input": {
      fontSize: 18,
    },
    ".component-overview-group": {
      marginTop: 24,
    },
    ".component-overview-group-title": {
      margin: "0 0 16px",
      color: token.colorText,
    },
    ".component-overview-card-link": {
      color: "inherit",
      textDecoration: "none",
    },
    ".component-overview-card": {
      height: "100%",
      cursor: "pointer",
      transition: `transform ${token.motionDurationMid}, box-shadow ${token.motionDurationMid}`,
    },
    ".component-overview-card:hover": {
      transform: "translateY(-2px)",
      boxShadow: token.boxShadowSecondary,
    },
    ".component-overview-card-image-wrap": {
      height: 132,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    ".component-overview-card-image": {
      maxHeight: "100%",
      maxWidth: "100%",
      objectFit: "cover",
    },
    ".component-overview-card-subtitle": {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.4,
      color: token.colorTextSecondary,
    },
    ".component-overview-empty": {
      marginTop: 40,
    },
    "@media (max-width: 768px)": {
      ".component-overview-search-affix.is-affixed": {
        marginInline: -6,
      },
    },
  },
}));

const search = ref("");
const searchBarAffixed = ref(false);
const { locale } = useLocale();
const { isDark } = useDarkMode();
const styleState = useStyles();

const currentLocale = computed<OverviewLocale>(() =>
  locale.value === "en-US" ? "en-US" : "zh-CN",
);

const uiText = computed(() => {
  if (currentLocale.value === "en-US") {
    return {
      searchPlaceholder: "Search components",
      empty: "No matching components found",
    };
  }

  return {
    searchPlaceholder: "搜索组件",
    empty: "没有找到匹配的组件",
  };
});

const groupedItems = computed<OverviewGroup[]>(() => {
  const keyword = search.value.trim().toLowerCase();
  const filtered = componentOverviewItems
    .filter(item => {
      if (!keyword) return true;

      const searchableText = [
        item.title,
        item.slug,
        item.subtitle[currentLocale.value] ?? "",
        item.description[currentLocale.value],
        item.group[currentLocale.value],
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    })
    .sort((left, right) => {
      if (left.groupOrder !== right.groupOrder)
        return left.groupOrder - right.groupOrder;
      return left.title.localeCompare(right.title);
    });

  const groupsMap = new Map<string, OverviewGroup>();
  filtered.forEach(item => {
    const groupLabel = item.group[currentLocale.value];
    const key = `${item.groupOrder}-${groupLabel}`;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        label: groupLabel,
        order: item.groupOrder,
        items: [],
      });
    }

    groupsMap.get(key)!.items.push(item);
  });

  return Array.from(groupsMap.values()).sort(
    (left, right) => left.order - right.order,
  );
});

function resolveComponentPath(path: string) {
  return currentLocale.value === "en-US" ? `${path}-en` : path;
}

function normalizeCover(url: string) {
  return url.replace(/originaloriginal$/, "original");
}

function resolveCover(item: ComponentOverviewItem) {
  const preferred = isDark.value ? item.coverDark : item.cover;
  const fallback = isDark.value ? item.cover : item.coverDark;
  return normalizeCover(preferred || fallback);
}

function handleAffixChange(affixed?: boolean) {
  searchBarAffixed.value = affixed ?? false;
}
</script>

<template>
  <section class="component-overview" :class="styleState.styles.root">
    <a-affix :offset-top="80" @change="handleAffixChange">
      <div
        class="component-overview-search-affix"
        :class="{ 'is-affixed': searchBarAffixed }"
      >
        <a-input
          v-model:value="search"
          auto-focus
          allow-clear
          variant="borderless"
          class="component-overview-search-input"
          :placeholder="uiText.searchPlaceholder"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
    </a-affix>

    <template v-if="groupedItems.length">
      <section
        v-for="group in groupedItems"
        :key="group.key"
        class="component-overview-group"
      >
        <h2 class="component-overview-group-title">
          <a-space>
            {{ group.label }}
            <a-tag>{{ group.items.length }}</a-tag>
          </a-space>
        </h2>

        <a-row :gutter="[20, 20]">
          <a-col
            v-for="item in group.items"
            :key="item.path"
            :xs="24"
            :sm="12"
            :lg="8"
            :xl="6"
          >
            <router-link
              class="component-overview-card-link"
              :to="resolveComponentPath(item.path)"
            >
              <a-card size="small" class="component-overview-card">
                <template #title>
                  <span class="mr-4px">{{ item.title }}</span>
                  <span
                    v-if="item.subtitle[currentLocale]"
                    class="component-overview-card-subtitle"
                  >
                    {{ item.subtitle[currentLocale] }}
                  </span>
                </template>

                <div class="component-overview-card-image-wrap">
                  <img
                    class="component-overview-card-image"
                    :src="resolveCover(item)"
                    :alt="item.title"
                    loading="lazy"
                  />
                </div>
              </a-card>
            </router-link>
          </a-col>
        </a-row>
      </section>
    </template>

    <a-empty
      v-else
      class="component-overview-empty"
      :description="uiText.empty"
    />
  </section>
</template>
