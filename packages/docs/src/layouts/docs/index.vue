<script setup lang="ts">
import type { MenuEmits } from "antdv-next";

import { createStyles } from "antdv-style";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { componentOverviewItems } from "@/components/component-overview/data";
import { useDocPage } from "@/composables/use-doc-page";
import { headerLocales } from "@/config/header";
import { docsRoutes, LOCALE_EN_US, LOCALE_ZH_CN } from "@/router/docs";
import { useAppStore } from "@/stores/app";

import DocHeader from "./components/doc-header.vue";

const useStyles = createStyles(({ token }) => ({
  root: {
    minHeight: "100vh",
    background: token.colorBgLayout,
    transition: `background-color ${token.motionDurationSlow}`,
    ".antd-doc-layout-main": {
      maxWidth: 1680,
      margin: "0 auto",
      padding: "24px 24px 40px",
      display: "grid",
      gridTemplateColumns: "240px minmax(0, 1fr) 200px",
      gap: 40,
    },
    ".antd-doc-layout-sider": {
      position: "sticky",
      top: 88,
      alignSelf: "start",
      maxHeight: "calc(100vh - 96px)",
      overflow: "hidden",
      scrollbarWidth: "thin",
      scrollbarGutter: "stable",
      paddingRight: 8,
    },
    ".antd-doc-layout-sider:hover": {
      overflowY: "auto",
    },
    ".antd-doc-layout-sider-title": {
      margin: "0 0 12px",
      fontSize: 16,
      fontWeight: 600,
      color: token.colorText,
    },
    ".antd-doc-layout-sider .ant-menu": {
      minHeight: "100%",
      paddingTop: 0,
      paddingBottom: `${token.marginXXL}px !important`,
      paddingInline: token.marginXXS,
      borderInlineEnd: "none",
      background: "transparent !important",
    },
    ".antd-doc-layout-content": {
      minWidth: 0,
      padding: 0,
    },
    ".antd-doc-layout-content-header": {
      marginBottom: 24,
    },
    ".antd-doc-layout-content-title": {
      margin: 0,
      fontSize: 34,
      lineHeight: 1.2,
      display: "inline-flex",
      alignItems: "baseline",
      gap: 12,
    },
    ".antd-doc-layout-content-subtitle": {
      fontSize: 16,
      color: token.colorTextTertiary,
      fontWeight: 500,
    },
    ".antd-doc-layout-content-description": {
      margin: "12px 0 0",
      fontSize: 16,
      color: token.colorTextSecondary,
    },
    ".antd-doc-layout-anchor": {
      position: "sticky",
      top: 88,
      alignSelf: "start",
      maxHeight: "calc(100vh - 96px)",
      overflow: "auto",
      scrollbarWidth: "thin",
      scrollbarGutter: "stable",
      paddingLeft: 8,
    },
    ".antd-doc-layout-anchor .ant-anchor-wrapper": {
      background: "transparent",
    },
    "@media (max-width: 1280px)": {
      ".antd-doc-layout-main": {
        gridTemplateColumns: "220px minmax(0, 1fr)",
        gap: 32,
      },
      ".antd-doc-layout-anchor": {
        display: "none",
      },
    },
    "@media (max-width: 900px)": {
      ".antd-doc-layout-main": {
        gridTemplateColumns: "minmax(0, 1fr)",
        padding: 16,
      },
      ".antd-doc-layout-sider": {
        display: "none",
      },
      ".antd-doc-layout-content-title": {
        fontSize: 28,
      },
    },
  },
}));

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { pageData, anchorItems } = useDocPage();
const styleState = useStyles();

function normalizePath(path: string) {
  if (path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

function stripLocaleSuffix(path: string) {
  if (path.endsWith("-en")) return path.slice(0, -3) || "/";
  if (path.endsWith("-cn")) return path.slice(0, -3) || "/";
  return path;
}

function formatSegmentLabel(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map(word => (word[0] ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

interface SiderLeafItem {
  key: string;
  label: string;
}

interface SiderGroupItem {
  key: string;
  type: "group";
  label: string;
  children: SiderLeafItem[];
}

type SiderItem = SiderLeafItem | SiderGroupItem;

type LocaleKey = typeof LOCALE_ZH_CN | typeof LOCALE_EN_US;

interface ParsedPageMeta {
  title?: string;
  order?: number;
  groupTitle?: string;
  groupOrder?: number;
}

const markdownRawPages = import.meta.glob("../../pages/markdown/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function normalizeSourcePath(path: string) {
  return path.replace(/^(\.\.\/)+/, "");
}

function toOptionalNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value.trim().replace(/^['"]|['"]$/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalText(value?: string) {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseFrontmatterMeta(markdown: string): ParsedPageMeta {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const title = toOptionalText(frontmatter.match(/^title:\s*(.+)$/m)?.[1]);
  const order = toOptionalNumber(frontmatter.match(/^order:\s*(.+)$/m)?.[1]);

  const groupBlock = frontmatter.match(/^group:\s*\n((?:[ \t].*\n?)*)/m)?.[1];
  const groupTitle = toOptionalText(
    groupBlock?.match(/^[ \t]+title:\s*(.+)$/m)?.[1],
  );
  const groupOrder = toOptionalNumber(
    groupBlock?.match(/^[ \t]+order:\s*(.+)$/m)?.[1],
  );

  return {
    title,
    order,
    groupTitle,
    groupOrder,
  };
}

const markdownMetaBySource = new Map<string, ParsedPageMeta>(
  Object.entries(markdownRawPages).map(([source, markdown]) => [
    normalizeSourcePath(source),
    parseFrontmatterMeta(markdown),
  ]),
);

const normalizedCurrentPath = computed(() => normalizePath(route.path));
const currentPathWithoutLocale = computed(() =>
  stripLocaleSuffix(normalizedCurrentPath.value),
);

const currentSectionKey = computed(() => {
  const segments = currentPathWithoutLocale.value.split("/").filter(Boolean);
  if (!segments.length) return "";
  return `/${segments[0]}`;
});

const sectionTitle = computed(() => {
  const locale = appStore.locale === LOCALE_EN_US ? LOCALE_EN_US : LOCALE_ZH_CN;
  const section = currentSectionKey.value;
  if (!section) return "";
  return (
    headerLocales?.[section]?.[locale] || formatSegmentLabel(section.slice(1))
  );
});

const siderItems = computed<SiderItem[]>(() => {
  const section = currentSectionKey.value;
  if (!section) return [];

  const locale = appStore.locale;
  const localeKey = locale === LOCALE_EN_US ? LOCALE_EN_US : LOCALE_ZH_CN;
  const routesInSection = docsRoutes
    .filter(item => {
      if (item.meta?.locale !== locale) return false;
      const normalizedPath = stripLocaleSuffix(normalizePath(item.path));
      return (
        normalizedPath === section || normalizedPath.startsWith(`${section}/`)
      );
    })
    .sort((left, right) => {
      const leftPath = stripLocaleSuffix(normalizePath(left.path));
      const rightPath = stripLocaleSuffix(normalizePath(right.path));
      if (leftPath === section) return -1;
      if (rightPath === section) return 1;
      return leftPath.localeCompare(rightPath);
    });

  const baseItems = routesInSection.map(item => {
    const withoutLocale = stripLocaleSuffix(normalizePath(item.path));
    const segments = withoutLocale.split("/").filter(Boolean);
    const lastSegment = segments.at(-1) || "";
    const isSectionIndex = withoutLocale === section;
    const source = normalizeSourcePath(String(item.meta?.source || ""));
    const pageMeta = markdownMetaBySource.get(source);

    return {
      key: normalizePath(item.path),
      pathWithoutLocale: withoutLocale,
      slug: lastSegment,
      isSectionIndex,
      order: pageMeta?.order ?? Number.MAX_SAFE_INTEGER,
      groupTitle: pageMeta?.groupTitle,
      groupOrder: pageMeta?.groupOrder ?? Number.MAX_SAFE_INTEGER,
      label: isSectionIndex
        ? pageMeta?.title || (localeKey === LOCALE_ZH_CN ? "概览" : "Overview")
        : pageMeta?.title || formatSegmentLabel(lastSegment),
    };
  });

  if (section === "/markdown") {
    const ungrouped = baseItems
      .filter(item => !item.groupTitle)
      .sort((left, right) => {
        if (left.order !== right.order) return left.order - right.order;
        return left.label.localeCompare(right.label);
      })
      .map(({ key, label }) => ({ key, label }));

    const groups = new Map<
      string,
      {
        key: string;
        label: string;
        order: number;
        children: Array<{ key: string; label: string; order: number }>;
      }
    >();

    baseItems
      .filter(item => item.groupTitle)
      .forEach(item => {
        const groupLabel = item.groupTitle!;
        const groupOrder = item.groupOrder;
        const groupKey = `${groupOrder}-${groupLabel}`;

        if (!groups.has(groupKey)) {
          groups.set(groupKey, {
            key: groupKey,
            label: groupLabel,
            order: groupOrder,
            children: [],
          });
        }

        groups.get(groupKey)!.children.push({
          key: item.key,
          label: item.label,
          order: item.order,
        });
      });

    const groupedItems: SiderGroupItem[] = Array.from(groups.values())
      .sort((left, right) => {
        if (left.order !== right.order) return left.order - right.order;
        return left.label.localeCompare(right.label);
      })
      .map(group => ({
        key: group.key,
        type: "group",
        label: group.label,
        children: group.children
          .sort((left, right) => {
            if (left.order !== right.order) return left.order - right.order;
            return left.label.localeCompare(right.label);
          })
          .map(({ key, label }) => ({ key, label })),
      }));

    return [...ungrouped, ...groupedItems];
  }

  if (section !== "/components")
    return baseItems.map(({ key, label }) => ({ key, label }));

  const fallbackGroupLabel =
    localeKey === LOCALE_ZH_CN ? "未分类" : "Ungrouped";
  const overviewItem = baseItems.find(item => item.isSectionIndex);

  const groups = new Map<
    string,
    { key: string; label: string; order: number; children: SiderLeafItem[] }
  >();
  baseItems
    .filter(item => !item.isSectionIndex)
    .forEach(item => {
      const meta = componentOverviewItems.find(info => info.slug === item.slug);
      const groupLabel = meta?.group?.[localeKey] ?? fallbackGroupLabel;
      const groupOrder = meta?.groupOrder ?? Number.MAX_SAFE_INTEGER;
      const groupKey = `${groupOrder}-${groupLabel}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label: groupLabel,
          order: groupOrder,
          children: [],
        });
      }

      groups.get(groupKey)!.children.push({
        key: item.key,
        label: meta?.title ?? item.label,
      });
    });

  const groupedItems: SiderGroupItem[] = Array.from(groups.values())
    .sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order;
      return left.label.localeCompare(right.label);
    })
    .map(group => ({
      key: group.key,
      type: "group",
      label: group.label,
      children: group.children.sort((left, right) =>
        left.label.localeCompare(right.label),
      ),
    }));

  return [
    ...(overviewItem
      ? [{ key: overviewItem.key, label: overviewItem.label }]
      : []),
    ...groupedItems,
  ];
});

const selectedSiderKeys = computed(() => [normalizedCurrentPath.value]);
const hasAnchors = computed(() => anchorItems.value.length > 0);

const handleSiderMenuClick: MenuEmits["click"] = info => {
  router.push(String(info.key));
};
</script>

<template>
  <div class="antd-doc-layout" :class="styleState.styles.root">
    <DocHeader />

    <main class="antd-doc-layout-main">
      <aside v-if="siderItems.length" class="antd-doc-layout-sider">
        <h2 class="antd-doc-layout-sider-title">
          {{ sectionTitle }}
        </h2>
        <a-menu
          class="ant-doc-main-sider-menu"
          mode="inline"
          :items="siderItems"
          :selected-keys="selectedSiderKeys"
          @click="handleSiderMenuClick"
        />
      </aside>

      <article class="antd-doc-layout-content">
        <header
          v-if="
            pageData?.frontmatter?.title || pageData?.frontmatter?.description
          "
          class="antd-doc-layout-content-header"
        >
          <h1
            v-if="pageData?.frontmatter?.title"
            class="antd-doc-layout-content-title"
          >
            {{ pageData?.frontmatter?.title }}
            <small
              v-if="pageData?.frontmatter?.subtitle"
              class="antd-doc-layout-content-subtitle"
            >
              {{ pageData?.frontmatter?.subtitle }}
            </small>
          </h1>
          <p
            v-if="pageData?.frontmatter?.description"
            class="antd-doc-layout-content-description"
          >
            {{ pageData?.frontmatter?.description }}
          </p>
        </header>
        <router-view />
      </article>

      <aside v-if="hasAnchors" class="antd-doc-layout-anchor">
        <a-anchor :items="anchorItems" :offset-top="88" :affix="false" />
      </aside>
    </main>
  </div>
</template>
