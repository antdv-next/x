<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import {
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, DatePicker, Radio, Space, Tag, Typography } from "antdv-next";
import dayjs, { type Dayjs } from "dayjs";
import { computed, h, onMounted, ref, watch } from "vue";

const contentHeader =
  "Hello! Welcome to our online booking service 🎉\n\n Please select your preferred date and time, and we will arrange the best seat for you. We look forward to seeing you!";
const orderConfirmation =
  "✅ Booking confirmed! Your order has been confirmed. We look forward to seeing you!";

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    typing: false,
    contentRender(content: ContentType | string) {
      if (!content || typeof content === "string") {
        return null;
      }

      const contentList = [...content.texts, ...content.card].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      return contentList.map((node, index) => {
        if ("text" in node && node.text) {
          return h(XMarkdown, { key: `text-${index}`, content: node.text });
        }

        if ("id" in node && node.id) {
          return h(XCardCard, { key: `card-${index}`, id: node.id });
        }

        return null;
      });
    },
  },
}));

// ─── Text ───────────────────────────────────────────────────────────────────
const Text = {
  name: "DemoText",
  props: {
    text: { type: String, default: "" },
    variant: { type: String, default: "body" },
    status: { type: String, default: undefined },
  },
  setup(props: any) {
    return () => {
      const text = typeof props.text === "string" ? props.text.trim() : "";
      if (!text) return null;

      const variant = props.status === "success" ? "success" : props.variant;

      if (variant === "body") {
        return text;
      }

      const styleMap: Record<string, any> = {
        h1: { fontSize: "20px", fontWeight: 700, margin: "0 0 12px" },
        h2: { fontSize: "17px", fontWeight: 600, margin: "0 0 8px" },
        h3: { fontSize: "15px", fontWeight: 600, margin: "0 0 6px" },
        success: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#52c41a",
          margin: "4px 0 0",
          padding: "6px 10px",
          borderRadius: "8px",
          background: "#f6ffed",
          border: "1px solid #b7eb8f",
        },
      };
      return <p style={styleMap[variant] || { fontSize: "14px", margin: 0 }}>{text}</p>;
    };
  },
};

// ─── DateTimeInput ──────────────────────────────────────────────────────────
const DateTimeInput = {
  name: "DateTimeInput",
  props: {
    action: { type: Object, default: undefined },
    status: { type: String, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props: any) {
    const dateValue = ref<Dayjs | null>(dayjs());

    const handleChange = (val: Dayjs | null) => {
      dateValue.value = val;
      if (!props.action?.name || !val) return;

      const context: Record<string, any> = {};
      if (Array.isArray(props.action.context)) {
        props.action.context.forEach((item: any) => {
          context[item.key] = val.toISOString();
        });
      }

      props.onAction?.(props.action.name, context);
    };

    return () => (
      <DatePicker
        value={dateValue.value}
        disabled={props.status === "success"}
        onUpdate:value={handleChange as any}
        format="YYYY-MM-DD"
        placeholder="Select date"
        style={{ width: "100%" }}
      />
    );
  },
};

// ─── BookForm ───────────────────────────────────────────────────────────────
const BookForm = {
  name: "BookForm",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "20px 20px 16px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          minWidth: "280px",
          marginBlock: "16px",
          maxWidth: "400px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          {slots.default?.()}
        </Space>
      </div>
    );
  },
};

// ─── ActionButton ───────────────────────────────────────────────────────────
const ActionButton = {
  name: "ActionButton",
  props: {
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
    variant: { type: String, default: undefined },
    status: { type: String, default: undefined },
    res: { type: Object, default: undefined },
  },
  setup(props: any, { slots }: any) {
    const handleClick = () => {
      const eventName = props.action?.name;
      if (!eventName || !props.onAction) return;

      const context: Record<string, any> = {};
      if (!props.res?.time || !props.res?.coffee) {
        context.status = "error";
        context.errorMessage = "Please select date and coffee first";
      } else {
        context.status = "success";
        context.res = props.res;
      }

      props.onAction(eventName, context);
    };

    return () => (
      <Button
        disabled={props.status === "success"}
        type={props.variant === "primary" ? "primary" : "default"}
        onClick={handleClick}
      >
        {slots.default?.()}
      </Button>
    );
  },
};

// ─── CoffeeList ─────────────────────────────────────────────────────────────
const DEFAULT_COFFEE_LIST = [
  {
    id: 1,
    name: "Latte",
    description: "Espresso + Steamed Milk, smooth and silky",
    price: 32,
    tag: "Hot",
  },
  { id: 2, name: "Americano", description: "Pure bitter aroma, refreshing", price: 25 },
  {
    id: 3,
    name: "Cappuccino",
    description: "Rich foam, classic Italian style",
    price: 30,
    tag: "Recommended",
  },
];

const CoffeeList = {
  name: "CoffeeList",
  props: {
    list: { type: Array, default: () => [] },
    description: { type: String, default: "" },
    status: { type: String, default: undefined },
    onAction: { type: Function, default: undefined },
    action: { type: Object, default: undefined },
  },
  setup(props: any) {
    const selectedId = ref<string | number | null>(null);

    const handleSelect = (itemId: string | number) => {
      selectedId.value = itemId;
      if (!props.action?.name) return;

      const coffeeList =
        props.list && (props.list as any[]).length > 0 ? props.list : DEFAULT_COFFEE_LIST;
      const selected = (coffeeList as any[]).find(
        (item: any, idx: number) => (item.id ?? idx) === itemId,
      );
      if (!selected) return;

      const context: Record<string, any> = {};
      if (Array.isArray(props.action.context)) {
        props.action.context.forEach((item: any) => {
          context[item.key] = selected;
        });
      }

      props.onAction?.(props.action.name, context);
    };

    return () => {
      const coffeeList =
        props.list && (props.list as any[]).length > 0 ? props.list : DEFAULT_COFFEE_LIST;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {props.description && (
            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              📋 {props.description}
            </Typography.Text>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(coffeeList as any[]).map((item: any, index: number) => {
              const itemId = item.id ?? index;
              const selected = selectedId.value === itemId;

              return (
                <div
                  key={itemId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    opacity: props.status === "success" ? 0.75 : 1,
                    cursor: props.status === "success" ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (props.status === "success") return;
                    handleSelect(itemId);
                  }}
                >
                  <Radio
                    checked={selected}
                    disabled={props.status === "success"}
                    style={{ marginInlineEnd: 0 }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "324px",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #6b3520 0%, #c8855a 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>☕</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "2px",
                        }}
                      >
                        <Typography.Text
                          strong
                          style={{ fontSize: "14px", color: "#1a1a1a", lineHeight: "20px" }}
                        >
                          {item.name}
                        </Typography.Text>
                        {item.tag && (
                          <Tag
                            style={{
                              fontSize: "11px",
                              padding: "0 6px",
                              lineHeight: "18px",
                              borderRadius: "8px",
                              color: "#d46b08",
                              background: "#fff7e6",
                              border: "1px solid #ffd591",
                              margin: 0,
                            }}
                          >
                            {item.tag}
                          </Tag>
                        )}
                      </div>
                      {item.description && (
                        <Typography.Text
                          type="secondary"
                          style={{
                            fontSize: "12px",
                            lineHeight: "18px",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.description}
                        </Typography.Text>
                      )}
                    </div>
                    {item.price !== undefined && (
                      <Typography.Text
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#d46b08",
                          flexShrink: 0,
                        }}
                      >
                        ¥{item.price}
                      </Typography.Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  },
};

// ─── CoffeeResultCard ───────────────────────────────────────────────────────
const CoffeeResultCard = {
  name: "CoffeeResultCard",
  props: {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: [String, Number], default: undefined },
    tag: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  setup(props: any) {
    return () => {
      const formattedDate = props.date ? dayjs(props.date).format("YYYY-MM-DD HH:mm") : "";

      return (
        <div
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            background: "linear-gradient(145deg, #3d1f0d 0%, #6b3520 50%, #8b5a2b 100%)",
            boxShadow: "0 8px 32px rgba(61,31,13,0.35)",
            minWidth: "280px",
            maxWidth: "380px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "28px 24px 16px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.12)",
                border: "2px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ fontSize: "40px" }}>☕</span>
            </div>
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Typography.Text
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.5px",
                }}
              >
                {props.name || "Unknown Coffee"}
              </Typography.Text>
              {props.tag && (
                <Tag
                  style={{
                    background: "rgba(255,200,100,0.25)",
                    border: "1px solid rgba(255,200,100,0.5)",
                    color: "#ffd580",
                    fontSize: "11px",
                    padding: "0 7px",
                    lineHeight: "20px",
                    borderRadius: "10px",
                    margin: 0,
                  }}
                >
                  {props.tag}
                </Tag>
              )}
            </div>

            {props.description && (
              <Typography.Text
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: "16px",
                }}
              >
                {props.description}
              </Typography.Text>
            )}

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.12)",
                margin: "0 0 16px",
              }}
            />

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              {props.price !== undefined && props.price !== "" ? (
                <div>
                  <Typography.Text
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block" }}
                  >
                    Price
                  </Typography.Text>
                  <Typography.Text
                    style={{ fontSize: "20px", fontWeight: 700, color: "#ffd580" }}
                  >
                    ¥{props.price}
                  </Typography.Text>
                </div>
              ) : (
                <div />
              )}

              {formattedDate && (
                <div style={{ textAlign: "right" }}>
                  <Typography.Text
                    style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "block" }}
                  >
                    Booking Time
                  </Typography.Text>
                  <Typography.Text
                    style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}
                  >
                    {formattedDate}
                  </Typography.Text>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "8px 14px",
                borderRadius: "12px",
                background: "rgba(82,196,26,0.15)",
                border: "1px solid rgba(82,196,26,0.35)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span style={{ fontSize: "14px" }}>✅</span>
              <Typography.Text style={{ fontSize: "13px", color: "#95de64", fontWeight: 500 }}>
                Booking confirmed! We look forward to seeing you!
              </Typography.Text>
            </div>
          </div>
        </div>
      );
    };
  },
};

// ─── Streaming text ─────────────────────────────────────────────────────────
function useStreamText(text: string) {
  const textRef = ref(0);
  const textIndex = ref(0);
  const textTimestamp = ref(0);
  const streamStatus = ref<"INIT" | "RUNNING" | "FINISHED">("INIT");
  let timer: ReturnType<typeof setInterval> | null = null;

  const run = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (textRef.value < text.length) {
        if (textTimestamp.value === 0) {
          textTimestamp.value = Date.now();
          streamStatus.value = "RUNNING";
        }
        textRef.value = Math.min(textRef.value + 3, text.length);
        textIndex.value = textRef.value;
      } else {
        streamStatus.value = "FINISHED";
        if (timer) clearInterval(timer);
      }
    }, 100);
  };

  const reset = () => {
    if (timer) clearInterval(timer);
    timer = null;
    textRef.value = 0;
    textTimestamp.value = 0;
    textIndex.value = 0;
    streamStatus.value = "INIT";
  };

  return {
    text: computed(() => text.slice(0, textIndex.value)),
    streamStatus,
    timestamp: textTimestamp,
    run,
    reset,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// v0.8 Agent Command definitions
// ═══════════════════════════════════════════════════════════════════════════

const SurfaceUpdateCommand = {
  surfaceUpdate: {
    surfaceId: "booking",
    components: [
      {
        id: "title",
        component: {
          Text: {
            text: { literalString: "Coffee Shop Order" },
            variant: { literalString: "h1" },
          },
        },
      },
      {
        id: "datetime",
        component: {
          DateTimeInput: {
            status: { path: "/status" },
            action: {
              name: "select_date",
              context: [{ key: "time", value: { path: "/res/time" } }],
            },
          },
        },
      },
      {
        id: "coffee_list",
        component: {
          CoffeeList: {
            description: { literalString: "Please select your favorite coffee" },
            status: { path: "/status" },
            action: {
              name: "select_coffee",
              context: [{ key: "coffee", value: { path: "/res/coffee" } }],
            },
          },
        },
      },
      {
        id: "status-text",
        component: {
          Text: {
            status: { path: "/status" },
            variant: { literalString: "success" },
          },
        },
      },
      {
        id: "submit-text",
        component: {
          Text: {
            text: { literalString: "Confirm Order" },
          },
        },
      },
      {
        id: "submit-btn",
        component: {
          ActionButton: {
            child: "submit-text",
            variant: { literalString: "primary" },
            status: { path: "/status" },
            res: { path: "/res" },
            action: {
              name: "confirm_booking",
              context: [
                { key: "status", value: { path: "/status" } },
                { key: "res", value: { path: "/res" } },
              ],
            },
          },
        },
      },
      {
        id: "root",
        component: {
          BookForm: {
            children: {
              explicitList: ["title", "datetime", "coffee_list", "status-text", "submit-btn"],
            },
          },
        },
      },
    ],
  },
};

const DataModelUpdateCommand = {
  dataModelUpdate: {
    surfaceId: "booking",
    contents: [
      {
        key: "res",
        valueMap: [{ key: "time", valueString: new Date().toISOString() }],
      },
    ],
  },
};

const BeginRenderingCommand = {
  beginRendering: {
    surfaceId: "booking",
    root: "root",
  },
};

const ResultSurfaceUpdateCommand = (res: any) => ({
  surfaceUpdate: {
    surfaceId: "result",
    components: [
      {
        id: "result-card",
        component: {
          CoffeeResultCard: {
            name: { literalString: res?.coffee?.name ?? "" },
            description: { literalString: res?.coffee?.description ?? "" },
            price: { literalString: String(res?.coffee?.price ?? "") },
            tag: { literalString: res?.coffee?.tag ?? "" },
            date: { literalString: res?.time ?? "" },
          },
        },
      },
      {
        id: "root",
        component: {
          BookForm: {
            children: { explicitList: ["result-card"] },
          },
        },
      },
    ],
  },
});

const ResultBeginRenderingCommand = {
  beginRendering: {
    surfaceId: "result",
    root: "root",
  },
};

const DeleteBookingCommand = {
  deleteSurface: {
    surfaceId: "booking",
  },
};

// ─── App state ──────────────────────────────────────────────────────────────
const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);

const onAgentCommand = (command: any) => {
  if ("surfaceUpdate" in command) {
    const surfaceId = command.surfaceUpdate.surfaceId;
    if (!card.value.some(c => c.id === surfaceId)) {
      card.value = [...card.value, { id: surfaceId, timestamp: Date.now() }];
    }
  } else if ("deleteSurface" in command) {
    card.value = card.value.filter(c => c.id !== command.deleteSurface.surfaceId);
  }
  commandQueue.value = [...commandQueue.value, command];
};

const handleAction = (payload: ActionPayload) => {
  if (payload.name !== "confirm_booking") return;
  const { res, status } = payload.context || {};

  if (status === "success" && res) {
    runFooter();
    onAgentCommand(DeleteBookingCommand);
    onAgentCommand(ResultSurfaceUpdateCommand(res));
    onAgentCommand(ResultBeginRenderingCommand);
  } else if (status === "error") {
    // eslint-disable-next-line no-console
    console.log("❌ Booking failed:", (payload.context as any)?.errorMessage);
  }
};

const {
  text: textHeader,
  streamStatus: streamStatusHeader,
  timestamp: timestampHeader,
  run: runHeader,
  reset: resetHeader,
} = useStreamText(contentHeader);

const {
  text: textFooter,
  timestamp: timestampFooter,
  run: runFooter,
  reset: resetFooter,
} = useStreamText(orderConfirmation);

const handleReload = () => {
  resetHeader();
  resetFooter();
  commandQueue.value = [
    ...commandQueue.value,
    { deleteSurface: { surfaceId: "booking" } },
    { deleteSurface: { surfaceId: "result" } },
  ];
  card.value = [];

  setTimeout(() => {
    sessionKey.value += 1;
    runHeader();
  }, 50);
};

const items = computed(() => [
  (() => {
    const textNodes = [
      { text: textHeader.value, timestamp: timestampHeader.value },
      { text: textFooter.value, timestamp: timestampFooter.value },
    ].filter(item => item.timestamp !== 0);

    const hasRenderableContent = textNodes.length > 0 || card.value.length > 0;

    return {
      content: hasRenderableContent
        ? ({
            texts: textNodes,
            card: card.value,
          } as ContentType)
        : "",
      typing: false,
      role: "assistant",
      key: sessionKey.value,
    };
  })(),
]);

onMounted(() => {
  runHeader();
});

watch(
  () => streamStatusHeader.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(SurfaceUpdateCommand);
      onAgentCommand(DataModelUpdateCommand);
      onAgentCommand(BeginRenderingCommand);
    }
  },
);

const components = {
  Text,
  DateTimeInput,
  BookForm,
  ActionButton,
  CoffeeList,
  CoffeeResultCard,
};
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <Button type="primary" :icon="h(ReloadOutlined)" @click="handleReload">
        Reload
      </Button>
    </div>

    <XCardBox
      :key="sessionKey"
      :commands="commandQueue"
      :on-action="handleAction"
      :components="components"
    >
      <BubbleList :items="items" style="height: 620px" :role="role" />
    </XCardBox>
  </div>
</template>

<style scoped>
:deep(.ant-picker) {
  padding-block: 0;
}
:deep(.ant-picker .ant-picker-input > input),
:deep(.ant-picker .ant-picker-input) {
  height: 30px;
}
</style>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.8 协议的基础示例。演示了如何使用 `XAgentCommand_v0_8` 命令来创建咖啡预订场景的交互卡片。
</docs>

<docs lang="en-US">
Basic example of implementing A2UI v0.8 protocol with XCard. Demonstrates how to use `XAgentCommand_v0_8` commands to create an interactive card for a coffee booking scenario.
</docs>
