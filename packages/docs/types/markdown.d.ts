declare module "*.md" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

declare module "virtual:demos" {
  interface DemoLocale {
    html?: string;
    title?: string;
  }

  interface DemoModule {
    component?: () => Promise<unknown>;
    locales?: Record<string, DemoLocale>;
    source?: string;
    jsSource?: string;
    html?: string;
    jsHtml?: string;
  }

  export function loadDemo(id: string): Promise<DemoModule | null>;

  const demos: Record<string, DemoModule>;
  export default demos;
}
