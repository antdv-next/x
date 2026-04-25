import { defineComponent, h } from "vue";

export type ScenarioKey =
  | "basic"
  | "progressive"
  | "streaming"
  | "nested-interaction"
  | "filter-search"
  | "form-validation";

const scenarioText: Record<
  ScenarioKey,
  { title: string; detail: string; init: string; next: string }
> = {
  basic: {
    title: "Basic Flow",
    detail: "Create surface, render nodes, then update data model.",
    init: "Status: pending",
    next: "Status: confirmed",
  },
  progressive: {
    title: "Progressive Rendering",
    detail: "UI fills in data progressively as commands arrive.",
    init: "Phase: skeleton",
    next: "Phase: completed",
  },
  streaming: {
    title: "Streaming Update",
    detail: "Message is appended in small data model updates.",
    init: "Stream: H",
    next: "Stream: Hello from XCard",
  },
  "nested-interaction": {
    title: "Nested Interaction",
    detail: "Nested paths are resolved into component props.",
    init: "Seat: A-01",
    next: "Seat: A-03",
  },
  "filter-search": {
    title: "Filter Search",
    detail: "Search result values can be updated by path.",
    init: "Result: 2 items",
    next: "Result: 5 items",
  },
  "form-validation": {
    title: "Form Validation",
    detail: "Validation hint is updated from invalid to valid.",
    init: "Validation: email required",
    next: "Validation: passed",
  },
};

export const Panel = defineComponent({
  name: "CardDemoPanel",
  setup(_, { slots }) {
    return () =>
      h(
        "div",
        {
          style: {
            border: "1px solid #d9d9d9",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "420px",
          },
        },
        slots.default?.(),
      );
  },
});

export const Text = defineComponent({
  name: "CardDemoText",
  props: {
    text: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () => h("div", props.text);
  },
});

export const components = {
  Panel,
  Text,
};

export const delay = (fn: () => void, ms: number): void => {
  setTimeout(fn, ms);
};

export function buildV09Commands(
  surfaceId: string,
  scenario: ScenarioKey,
): any[] {
  const text = scenarioText[scenario];

  return [
    {
      version: "v0.9",
      createSurface: { surfaceId },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: [
          {
            id: "root",
            component: "Panel",
            children: ["title", "detail", "status"],
          },
          { id: "title", component: "Text", text: text.title },
          { id: "detail", component: "Text", text: text.detail },
          { id: "status", component: "Text", text: { path: "/status" } },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId,
        path: "/status",
        value: text.init,
      },
    },
  ];
}

export function appendV09Update(
  commands: any[],
  surfaceId: string,
  scenario: ScenarioKey,
): any[] {
  return [
    ...commands,
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId,
        path: "/status",
        value: scenarioText[scenario].next,
      },
    },
  ];
}

export function buildV08Commands(
  surfaceId: string,
  scenario: ScenarioKey,
): any[] {
  const text = scenarioText[scenario];

  return [
    {
      surfaceUpdate: {
        surfaceId,
        components: [
          {
            id: "root",
            component: {
              Panel: {
                children: { explicitList: ["title", "detail", "status"] },
              },
            },
          },
          {
            id: "title",
            component: {
              Text: {
                text: { literalString: text.title },
              },
            },
          },
          {
            id: "detail",
            component: {
              Text: {
                text: { literalString: text.detail },
              },
            },
          },
          {
            id: "status",
            component: {
              Text: {
                text: { path: "/status" },
              },
            },
          },
        ],
      },
    },
    {
      dataModelUpdate: {
        surfaceId,
        contents: [{ key: "status", valueString: text.init }],
      },
    },
    {
      beginRendering: {
        surfaceId,
        root: "root",
      },
    },
  ];
}

export function appendV08Update(
  commands: any[],
  surfaceId: string,
  scenario: ScenarioKey,
): any[] {
  return [
    ...commands,
    {
      dataModelUpdate: {
        surfaceId,
        contents: [{ key: "status", valueString: scenarioText[scenario].next }],
      },
    },
  ];
}
