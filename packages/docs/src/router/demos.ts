import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";

import { getDemoId } from "@antdv-next/docs-plugins/dist/demo/get-demo-id";

const pageDemos = import.meta.glob<Component>(
  "/src/pages/components/**/demo/*.vue",
);

export function generateDemoRoutes(): RouteRecordRaw[] {
  return Object.entries(pageDemos).map(([path, component]) => ({
    path: `/~demos/${getDemoId(path)}`,
    component,
  }));
}

export default generateDemoRoutes();
