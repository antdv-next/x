import { nextTick } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import { DOC_HEADER_CONTENT_OFFSET } from "@/layouts/docs/components/header-shared";
import { i18n } from "@/locales";

import { docsRoutes, resolveDocRoutePath } from "./docs";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: async (to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;

    if (to.hash) {
      await nextTick();
      return {
        el: to.hash,
        top: DOC_HEADER_CONTENT_OFFSET,
      };
    }

    return {
      top: 0,
      left: 0,
    };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/home/index.vue"),
      meta: {
        forceDark: true,
      },
    },
    {
      path: "/docs-layout",
      name: "DocsLayout",
      component: () => import("../layouts/docs/index.vue"),
      children: docsRoutes,
    },
  ],
});

router.beforeEach(to => {
  const locale = i18n.global.locale.value;
  const localizedPath = resolveDocRoutePath(to.path, locale);

  if (!localizedPath || localizedPath === to.path) return true;

  return {
    path: localizedPath,
    query: to.query,
    hash: to.hash,
    replace: true,
  };
});

export default router;
