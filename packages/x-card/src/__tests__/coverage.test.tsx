import { mount } from "@vue/test-utils";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { defineComponent, nextTick } from "vue";

import {
  clearCatalogCache,
  loadCatalog,
  registerCatalog,
  XCardBox,
  XCardCard,
} from "../index";
import { validateComponentAgainstCatalog } from "../runtime/utils";

const Container = defineComponent({
  name: "Container",
  setup(_, { slots }) {
    return () => <div class="xcard-container">{slots.default?.()}</div>;
  },
});

const Text = defineComponent({
  name: "Text",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => <span class="xcard-text">{props.text}</span>;
  },
});

const ActionButton = defineComponent({
  name: "ActionButton",
  props: {
    label: { type: String, default: "submit" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props) {
    return () => (
      <button
        class="xcard-action-btn"
        onClick={() => {
          // Support both v0.8 flat shape `{ name, context }` and
          // v0.9 nested shape `{ event: { name, context } }`.
          const eventName = props.action?.event?.name ?? props.action?.name;
          if (eventName) {
            props.onAction?.(eventName, { input: "fresh-value" });
          }
        }}
      >
        {props.label}
      </button>
    );
  },
});

describe("XCard — command ordering", () => {
  it("v0.9: updateDataModel arriving before updateComponents still binds", async () => {
    const commands: any[] = [
      { version: "v0.9", createSurface: { surfaceId: "ord-1" } },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "ord-1",
          path: "/title",
          value: "Pre-bound",
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "ord-1",
          components: [
            { id: "root", component: "Container", children: ["title"] },
            { id: "title", component: "Text", text: { path: "/title" } },
          ],
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands, components: { Container, Text } },
      slots: { default: () => <XCardCard id="ord-1" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("Pre-bound");
  });

  it("v0.9: a later updateComponents replaces the previous tree", async () => {
    const wrapper = mount(XCardBox, {
      props: {
        components: { Container, Text },
        commands: [
          { version: "v0.9", createSurface: { surfaceId: "ord-2" } },
          {
            version: "v0.9",
            updateComponents: {
              surfaceId: "ord-2",
              components: [
                { id: "root", component: "Container", children: ["a"] },
                {
                  id: "a",
                  component: "Text",
                  text: { path: "/v" },
                },
              ],
            },
          },
          {
            version: "v0.9",
            updateDataModel: {
              surfaceId: "ord-2",
              path: "/v",
              value: "first",
            },
          },
        ],
      },
      slots: { default: () => <XCardCard id="ord-2" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("first");

    await wrapper.setProps({
      commands: [
        ...(wrapper.props("commands") as any[]),
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "ord-2",
            components: [
              { id: "root", component: "Container", children: ["b"] },
              {
                id: "b",
                component: "Text",
                text: { path: "/w" },
              },
            ],
          },
        },
        {
          version: "v0.9",
          updateDataModel: {
            surfaceId: "ord-2",
            path: "/w",
            value: "second",
          },
        },
      ],
    });

    await nextTick();
    expect(wrapper.text()).toContain("second");
    expect(wrapper.text()).not.toContain("first");
  });

  it("deleteSurface clears the rendered tree", async () => {
    const baseCommands: any[] = [
      { version: "v0.9", createSurface: { surfaceId: "del-1" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "del-1",
          components: [
            { id: "root", component: "Container", children: ["msg"] },
            { id: "msg", component: "Text", text: { path: "/msg" } },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "del-1",
          path: "/msg",
          value: "hello",
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands: baseCommands, components: { Container, Text } },
      slots: { default: () => <XCardCard id="del-1" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("hello");

    await wrapper.setProps({
      commands: [
        ...baseCommands,
        { version: "v0.9", deleteSurface: { surfaceId: "del-1" } },
      ],
    });

    await nextTick();
    expect(wrapper.findAll(".xcard-text").length).toBe(0);
  });

  it("v0.8: action context with `key`/`value` writes back to dataModel", async () => {
    const onAction = vi.fn();

    const commands: any[] = [
      {
        surfaceUpdate: {
          surfaceId: "v08-write",
          components: [
            {
              id: "root",
              component: {
                Container: { children: { explicitList: ["status", "btn"] } },
              },
            },
            {
              id: "status",
              component: { Text: { text: { path: "/status" } } },
            },
            {
              id: "btn",
              component: {
                ActionButton: {
                  label: { literalString: "Save" },
                  action: {
                    name: { literalString: "save" },
                    context: [{ key: "input", value: { path: "/status" } }],
                  },
                },
              },
            },
          ],
        },
      },
      {
        dataModelUpdate: {
          surfaceId: "v08-write",
          contents: [{ key: "status", valueString: "old" }],
        },
      },
      { beginRendering: { surfaceId: "v08-write", root: "root" } },
    ];

    const wrapper = mount(XCardBox, {
      props: {
        commands,
        onAction,
        components: { Container, Text, ActionButton },
      },
      slots: { default: () => <XCardCard id="v08-write" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("old");

    await wrapper.find(".xcard-action-btn").trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("fresh-value");
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: "save", surfaceId: "v08-write" }),
    );
  });
});

describe("XCard — multi-surface isolation", () => {
  it("two cards in the same Box keep independent dataModels", async () => {
    const commands: any[] = [
      { version: "v0.9", createSurface: { surfaceId: "a" } },
      { version: "v0.9", createSurface: { surfaceId: "b" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "a",
          components: [
            { id: "root", component: "Container", children: ["t"] },
            { id: "t", component: "Text", text: { path: "/text" } },
          ],
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "b",
          components: [
            { id: "root", component: "Container", children: ["t"] },
            { id: "t", component: "Text", text: { path: "/text" } },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "a", path: "/text", value: "AAA" },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "b", path: "/text", value: "BBB" },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands, components: { Container, Text } },
      slots: {
        default: () => (
          <>
            <div class="slot-a">
              <XCardCard id="a" />
            </div>
            <div class="slot-b">
              <XCardCard id="b" />
            </div>
          </>
        ),
      },
    });

    await nextTick();
    expect(wrapper.find(".slot-a").text()).toContain("AAA");
    expect(wrapper.find(".slot-a").text()).not.toContain("BBB");
    expect(wrapper.find(".slot-b").text()).toContain("BBB");
    expect(wrapper.find(".slot-b").text()).not.toContain("AAA");
  });
});

describe("XCard — missing component fallback", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns and renders nothing for an unregistered component, but keeps siblings", async () => {
    const commands: any[] = [
      { version: "v0.9", createSurface: { surfaceId: "miss" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "miss",
          components: [
            {
              id: "root",
              component: "Container",
              children: ["known", "unknown"],
            },
            { id: "known", component: "Text", text: { path: "/m" } },
            { id: "unknown", component: "DoesNotExist" },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "miss", path: "/m", value: "kept" },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands, components: { Container, Text } },
      slots: { default: () => <XCardCard id="miss" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("kept");
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'XCard component "DoesNotExist" is not registered',
      ),
    );
  });

  it("skips children whose id cannot be resolved by transformer", async () => {
    const commands: any[] = [
      { version: "v0.9", createSurface: { surfaceId: "ghost" } },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "ghost",
          components: [
            {
              id: "root",
              component: "Container",
              children: ["real", "missing-id"],
            },
            { id: "real", component: "Text", text: { path: "/m" } },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: { surfaceId: "ghost", path: "/m", value: "ok" },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands, components: { Container, Text } },
      slots: { default: () => <XCardCard id="ghost" /> },
    });

    await nextTick();
    expect(wrapper.text()).toContain("ok");
    expect(wrapper.findAll(".xcard-text").length).toBe(1);
  });
});

describe("XCard — catalog", () => {
  beforeEach(() => {
    clearCatalogCache();
  });

  it("registerCatalog + loadCatalog returns the cached entry without fetching", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch" as any)
      .mockImplementation(() => {
        throw new Error("fetch should not be called");
      });

    registerCatalog({
      $id: "https://example.com/cat.json",
      components: { Text: {} },
    } as any);

    const c = await loadCatalog("https://example.com/cat.json");
    expect(c.components).toHaveProperty("Text");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("loadCatalog returns an empty stub for local:// ids", async () => {
    const c = await loadCatalog("local://nothing.json");
    expect(c.$id).toBe("local://nothing.json");
    expect(c.components).toEqual({});
  });

  it("validateComponentAgainstCatalog: missing component is invalid", () => {
    const result = validateComponentAgainstCatalog(
      { components: { Text: {} } } as any,
      "Unknown",
      {},
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('"Unknown"');
  });

  it("validateComponentAgainstCatalog: missing required field is invalid", () => {
    const result = validateComponentAgainstCatalog(
      { components: { Text: { required: ["text"] } } } as any,
      "Text",
      {},
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('"text"');
  });

  it("validateComponentAgainstCatalog: missing catalog passes through", () => {
    const result = validateComponentAgainstCatalog(undefined, "Anything", {});
    expect(result.valid).toBe(true);
  });

  it("renders even when catalog reports validation errors (warning only)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerCatalog({
      $id: "local://strict-catalog",
      components: { Text: { required: ["text"] } },
    } as any);

    const commands: any[] = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "cat-1",
          catalogId: "local://strict-catalog",
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "cat-1",
          components: [
            { id: "root", component: "Container", children: ["t"] },
            { id: "t", component: "Text" },
          ],
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: { commands, components: { Container, Text } },
      slots: { default: () => <XCardCard id="cat-1" /> },
    });

    await nextTick();
    expect(wrapper.find(".xcard-text").exists()).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing required field "text"'),
    );
    warnSpy.mockRestore();
  });
});
