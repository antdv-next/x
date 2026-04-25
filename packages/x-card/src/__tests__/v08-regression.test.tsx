import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { nextTick, defineComponent } from "vue";

import { XCardBox, XCardCard } from "../index";

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

describe("XCard v0.8 regression", () => {
  it("renders with surfaceUpdate + dataModelUpdate + beginRendering", async () => {
    const commands: any[] = [
      {
        surfaceUpdate: {
          surfaceId: "v08-a",
          components: [
            {
              id: "root",
              component: {
                Container: {
                  children: { explicitList: ["title", "time"] },
                },
              },
            },
            {
              id: "title",
              component: {
                Text: {
                  text: { path: "/title" },
                },
              },
            },
            {
              id: "time",
              component: {
                Text: {
                  text: { path: "/res/time" },
                },
              },
            },
          ],
        },
      },
      {
        dataModelUpdate: {
          surfaceId: "v08-a",
          contents: [
            { key: "title", valueString: "Booking" },
            {
              key: "res",
              valueMap: [{ key: "time", valueString: "10:30" }],
            },
          ],
        },
      },
      {
        beginRendering: {
          surfaceId: "v08-a",
          root: "root",
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: {
        commands,
        components: { Container, Text },
      },
      slots: {
        default: () => <XCardCard id="v08-a" />,
      },
    });

    await nextTick();

    expect(wrapper.text()).toContain("Booking");
    expect(wrapper.text()).toContain("10:30");
  });

  it("renders when beginRendering arrives before surfaceUpdate", async () => {
    const commands: any[] = [
      {
        beginRendering: {
          surfaceId: "v08-b",
          root: "form-root",
        },
      },
    ];

    const wrapper = mount(XCardBox, {
      props: {
        commands,
        components: { Container, Text },
      },
      slots: {
        default: () => <XCardCard id="v08-b" />,
      },
    });

    await nextTick();
    expect(wrapper.findAll(".xcard-text").length).toBe(0);

    await wrapper.setProps({
      commands: [
        ...commands,
        {
          surfaceUpdate: {
            surfaceId: "v08-b",
            components: [
              {
                id: "form-root",
                component: {
                  Container: {
                    child: "message",
                  },
                },
              },
              {
                id: "message",
                component: {
                  Text: {
                    text: { path: "/message" },
                  },
                },
              },
            ],
          },
        },
      ],
    });

    await wrapper.setProps({
      commands: [
        ...commands,
        {
          surfaceUpdate: {
            surfaceId: "v08-b",
            components: [
              {
                id: "form-root",
                component: {
                  Container: {
                    child: "message",
                  },
                },
              },
              {
                id: "message",
                component: {
                  Text: {
                    text: { path: "/message" },
                  },
                },
              },
            ],
          },
        },
        {
          dataModelUpdate: {
            surfaceId: "v08-b",
            contents: [{ key: "message", valueString: "queued-begin" }],
          },
        },
      ],
    });

    await nextTick();

    expect(wrapper.text()).toContain("queued-begin");
  });
});
