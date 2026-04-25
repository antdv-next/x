import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
import { defineComponent, nextTick } from "vue";

import { XCardBox, XCardCard } from "../index";

const Panel = defineComponent({
  name: "Panel",
  setup(_, { slots }) {
    return () => <div class="xcard-panel">{slots.default?.()}</div>;
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
    return () => <span class="xcard-v09-text">{props.text}</span>;
  },
});

const ActionButton = defineComponent({
  name: "ActionButton",
  props: {
    label: {
      type: String,
      default: "submit",
    },
    action: {
      type: Object,
      default: undefined,
    },
    onAction: {
      type: Function,
      default: undefined,
    },
  },
  setup(props) {
    return () => (
      <button
        class="xcard-action-btn"
        onClick={() => {
          const eventName = props.action?.event?.name;
          if (eventName) {
            props.onAction?.(eventName, { status: "Status: done" });
          }
        }}
      >
        {props.label}
      </button>
    );
  },
});

describe("XCard v0.9 regression", () => {
  it("renders with createSurface + updateComponents + updateDataModel", async () => {
    const commands: any[] = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "v09-a",
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "v09-a",
          components: [
            {
              id: "root",
              component: "Panel",
              children: ["title", "time"],
            },
            {
              id: "title",
              component: "Text",
              text: { path: "/title" },
            },
            {
              id: "time",
              component: "Text",
              text: { path: "/res/time" },
            },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "v09-a",
          path: "/title",
          value: "Booking",
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "v09-a",
          path: "/res/time",
          value: "14:00",
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: {
        commands,
        components: { Panel, Text },
      },
      slots: {
        default: () => <XCardCard id="v09-a" />,
      },
    });

    await nextTick();

    expect(wrapper.text()).toContain("Booking");
    expect(wrapper.text()).toContain("14:00");
  });

  it("writes dataModel and reports payload from action context", async () => {
    const onAction = vi.fn();
    const commands: any[] = [
      {
        version: "v0.9",
        createSurface: {
          surfaceId: "v09-b",
        },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "v09-b",
          components: [
            {
              id: "root",
              component: "Panel",
              children: ["status", "button"],
            },
            {
              id: "status",
              component: "Text",
              text: { path: "/status" },
            },
            {
              id: "button",
              component: "ActionButton",
              label: "Commit",
              action: {
                event: {
                  name: "commit",
                  context: {
                    status: { path: "/status" },
                  },
                },
              },
            },
          ],
        },
      },
      {
        version: "v0.9",
        updateDataModel: {
          surfaceId: "v09-b",
          path: "/status",
          value: "Status: idle",
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: {
        commands,
        onAction,
        components: { Panel, Text, ActionButton },
      },
      slots: {
        default: () => <XCardCard id="v09-b" />,
      },
    });

    await nextTick();

    expect(wrapper.text()).toContain("Status: idle");

    await wrapper.find(".xcard-action-btn").trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("Status: done");
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "commit",
        surfaceId: "v09-b",
      }),
    );
  });
});
