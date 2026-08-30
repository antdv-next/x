declare module "*.md" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

/// <reference path="../node_modules/@antdv-next/docs-plugins/src/components/code-demo/virtual.d.ts" />
