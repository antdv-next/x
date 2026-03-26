<script lang="ts" setup>
import type { MenuEmits, MenuItemType } from "antdv-next";

import { EditOutlined } from "@antdv-next/icons";
import { createStyles } from "antdv-style";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { componentOverviewItems } from "@/components/component-overview/data";
import Contributors from "@/components/Contributors.vue";
import { useDocPage } from "@/composables/use-doc-page";
import { useLocale } from "@/composables/use-locale.ts";
import { docsRoutes, LOCALE_EN_US, LOCALE_ZH_CN } from "@/router/docs";
import { useAppStore } from "@/stores/app";

import DocHeader from "./components/doc-header.vue";

const useStyles = createStyles(({ token }) => ({
  root: {
    minHeight: "100vh",
    background: token.colorBgContainer,
    transition: `background-color ${token.motionDurationSlow}`,
    ".antd-doc-layout-main": {
      padding: "24px 48px 40px",
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
const { t } = useLocale();

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

type LocaleKey = typeof LOCALE_ZH_CN | typeof LOCALE_EN_US;

interface ParsedPageMeta {
  title?: string;
  order?: number;
  groupTitle?: string;
  groupOrder?: number;
  hidden?: boolean;
}

const docsRawPages = import.meta.glob("../../pages/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function normalizeSourcePath(path: string) {
  return path.replace(/^(\.\.\/)+/, "");
}

function toOptionalBoolean(value?: string) {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
}

function parseFrontmatterMeta(markdown: string): ParsedPageMeta {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  if (!frontmatter) return {};

  const title = toOptionalText(frontmatter.match(/^title:\s*(.+)$/m)?.[1]);
  const order = toOptionalNumber(frontmatter.match(/^order:\s*(.+)$/m)?.[1]);
  const hidden = toOptionalBoolean(frontmatter.match(/^hidden:\s*(.+)$/m)?.[1]);

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
    hidden,
  };
}

const pageMetaBySource = new Map<string, ParsedPageMeta>(
  Object.entries(docsRawPages).map(([source, markdown]) => [
    normalizeSourcePath(source),
    parseFrontmatterMeta(markdown),
  ]),
);
const componentOverviewMetaBySlug = new Map(
  componentOverviewItems.map(item => [item.slug, item]),
);

function getFallbackPageMeta(
  section: string,
  slug: string,
  localeKey: LocaleKey,
): Partial<ParsedPageMeta> {
  if (section !== "/components") return {};

  const meta = componentOverviewMetaBySlug.get(slug);
  if (!meta) return {};

  return {
    title: meta.title,
    groupTitle: meta.group[localeKey],
    groupOrder: meta.groupOrder,
  };
}

function sortSiderEntries(
  left: { order: number; label: string },
  right: { order: number; label: string },
) {
  if (left.order !== right.order) return left.order - right.order;
  return left.label.localeCompare(right.label);
}

function createGroupedSiderItems(
  items: Array<{
    key: string;
    label: string;
    order: number;
    hidden: boolean;
    isSectionIndex: boolean;
    groupTitle?: string;
    groupOrder: number;
  }>,
) {
  const visibleItems = items.filter(item => !item.hidden);
  const overviewItem = visibleItems.find(item => item.isSectionIndex);
  const contentItems = visibleItems.filter(item => !item.isSectionIndex);

  const ungroupedItems = contentItems
    .filter(item => !item.groupTitle)
    .sort(sortSiderEntries)
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

  contentItems
    .filter(item => item.groupTitle)
    .forEach(item => {
      const groupLabel = item.groupTitle!;
      const groupKey = `${item.groupOrder}-${groupLabel}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label: groupLabel,
          order: item.groupOrder,
          children: [],
        });
      }

      groups.get(groupKey)!.children.push({
        key: item.key,
        label: item.label,
        order: item.order,
      });
    });

  const groupedItems: MenuItemType[] = Array.from(groups.values())
    .sort(sortSiderEntries)
    .map(group => ({
      key: group.key,
      type: "group",
      label: group.label,
      children: group.children
        .sort(sortSiderEntries)
        .map(({ key, label }) => ({ key, label })),
    }));

  return [
    ...(overviewItem
      ? [{ key: overviewItem.key, label: overviewItem.label }]
      : []),
    ...ungroupedItems,
    ...groupedItems,
  ] satisfies MenuItemType[];
}

interface ParsedPageMeta {
  title?: string;
  order?: number;
  groupTitle?: string;
  groupOrder?: number;
  hidden?: boolean;
}

const markdownRawPages = import.meta.glob("../../pages/markdown/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function toOptionalNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value.trim().replace(/^['"]|['"]$/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalText(value?: string) {
  if (!value) return undefined;
  return value.trim().replace(/^['"]|['"]$/g, "");
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

const siderItems = computed<MenuItemType[]>(() => {
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
    const pageMeta = pageMetaBySource.get(source);
    const fallbackMeta = getFallbackPageMeta(section, lastSegment, localeKey);

    return {
      key: normalizePath(item.path),
      isSectionIndex,
      hidden: pageMeta?.hidden ?? false,
      order: pageMeta?.order ?? fallbackMeta.order ?? Number.MAX_SAFE_INTEGER,
      groupTitle: pageMeta?.groupTitle ?? fallbackMeta.groupTitle,
      groupOrder:
        pageMeta?.groupOrder ??
        fallbackMeta.groupOrder ??
        Number.MAX_SAFE_INTEGER,
      label:
        pageMeta?.title ||
        fallbackMeta.title ||
        formatSegmentLabel(lastSegment),
    };
  });

  return createGroupedSiderItems(baseItems);
});

const selectedSiderKeys = computed(() => [normalizedCurrentPath.value]);
const hasAnchors = computed(() => anchorItems.value.length > 0);

const handleSiderMenuClick: MenuEmits["click"] = info => {
  router.push(String(info.key));
};

const editGithubUrl = computed(() => {
  const pageRoute = docsRoutes.filter(r => r.name === route.name)?.[0]!;
  const path = ((pageRoute.meta?.source ?? "") as string).replace(
    "..",
    "packages/docs/src",
  );
  return `https://github.com/antdv-next/x/edit/main/${path}`;
});
</script>

<template>
  <div :class="styleState.styles.root" class="antd-doc-layout">
    <DocHeader />

    <main class="antd-doc-layout-main">
      <aside v-if="siderItems.length" class="antd-doc-layout-sider">
        <a-menu
          :items="siderItems"
          :selected-keys="selectedSiderKeys"
          class="ant-doc-main-sider-menu"
          mode="inline"
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
          <div class="flex gap-3 items-center">
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
            <a-tooltip :title="t('edit-page')" destroy-on-hidden>
              <a
                :href="editGithubUrl"
                class="cursor-pointer relative decoration-none align-mid ml-xs"
                rel="noopener noreferrer"
                target="_blank"
              >
                <EditOutlined
                  class="text-16px block"
                  style="color: var(--ant-color-text-tertiary)"
                />
              </a>
            </a-tooltip>
          </div>
          <p
            v-if="pageData?.frontmatter?.description"
            class="antd-doc-layout-content-description"
          >
            {{ pageData?.frontmatter?.description }}
          </p>
        </header>
        <router-view />
        <Suspense>
          <Contributors />
          <template #fallback> loading </template>
        </Suspense>
      </article>

      <aside v-if="hasAnchors" class="antd-doc-layout-anchor">
        <a-anchor :items="anchorItems" :offset-top="88" :affix="false" />
      </aside>
    </main>
  </div>
</template>
