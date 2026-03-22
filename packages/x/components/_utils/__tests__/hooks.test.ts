import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { computed, defineComponent, h, nextTick, ref } from "vue";

import { XProviderContextKey } from "../../x-provider/context";
import useXComponentConfig from "../hooks/use-x-component-config";
import useCollapsible from "../hooks/useCollapsible";

describe("useXComponentConfig", () => {
  it("should return default config when no provider", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useXComponentConfig("bubble");
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.value).toEqual({
      style: {},
      styles: {},
      classes: {},
      shortcutKeys: {},
    });
  });

  it("should merge provider config", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useXComponentConfig("bubble");
        return () => h("div");
      },
    });
    mount(Comp, {
      global: {
        provide: {
          [XProviderContextKey as symbol]: computed(() => ({
            bubble: {
              style: { color: "red" },
              classes: { root: "custom" },
            },
          })),
        },
      },
    });
    expect(result.value.style).toEqual({ color: "red" });
    expect(result.value.classes).toEqual({ root: "custom" });
    expect(result.value.styles).toEqual({});
  });
});

describe("useCollapsible", () => {
  it("should return disabled state when collapsible is falsy", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(computed(() => false));
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.enableCollapse.value).toBe(false);
    expect(result.expandedKeys.value).toEqual([]);
    expect(result.onItemExpand.value).toBeUndefined();
  });

  it("should return enabled state when collapsible is true", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(computed(() => true));
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.enableCollapse.value).toBe(true);
    expect(result.onItemExpand.value).toBeTypeOf("function");
  });

  it("should toggle expanded keys in uncontrolled mode", async () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(computed(() => true));
        return () => h("div");
      },
    });
    mount(Comp);

    result.onItemExpand.value("key1");
    await nextTick();
    expect(result.expandedKeys.value).toEqual(["key1"]);

    result.onItemExpand.value("key1");
    await nextTick();
    expect(result.expandedKeys.value).toEqual([]);
  });

  it("should respect defaultExpandedKeys", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(
          computed(() => ({ defaultExpandedKeys: ["a", "b"] })),
        );
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.expandedKeys.value).toEqual(["a", "b"]);
  });

  it("should call onExpand callback", async () => {
    let result: any;
    const expandedKeys: string[][] = [];
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(
          computed(() => ({
            onExpand: (keys: string[]) => expandedKeys.push(keys),
          })),
        );
        return () => h("div");
      },
    });
    mount(Comp);

    result.onItemExpand.value("key1");
    await nextTick();
    expect(expandedKeys).toEqual([["key1"]]);
  });

  it("should return collapse transition when enabled", () => {
    let result: any;
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(
          computed(() => true),
          computed(() => "root"),
        );
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.collapseTransition.value).toBeDefined();
    expect(result.collapseTransition.value.onBeforeEnter).toBeTypeOf(
      "function",
    );
  });

  it("should sync with controlled expandedKeys", async () => {
    let result: any;
    const controlledKeys = ref(["a"]);
    const Comp = defineComponent({
      setup() {
        result = useCollapsible(
          computed(() => ({ expandedKeys: controlledKeys.value })),
        );
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result.expandedKeys.value).toEqual(["a"]);

    controlledKeys.value = ["a", "b"];
    await nextTick();
    expect(result.expandedKeys.value).toEqual(["a", "b"]);
  });
});
