import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";

import { getDemoId } from "@antdv-next/docs-plugins/dist/demo/get-demo-id";

import DemoPage from "@/components/doc-demo/demo-page.vue";

const pageDemos = import.meta.glob<Component>(
  "/src/pages/components/**/demo/*.vue",
);

export function generateDemoRoutes(): RouteRecordRaw[] {
  return Object.entries(pageDemos).map(([path, component]) => ({
    path: `/~demos/${getDemoId(path)}`,
    component: DemoPage,
    props: { component },
  }));
}

export default generateDemoRoutes();
