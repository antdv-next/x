<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Card, Progress, Rate, Spin, Tag, Typography } from "antdv-next";
import { computed, h, onMounted, onUnmounted, ref, watch } from "vue";

import {
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: string;
  tags: string[];
  description: string;
}

const RESTAURANT_DATA: RestaurantItem[] = [
  {
    id: "r1",
    name: "Jiangnan Bistro",
    cuisine: "Jiangsu-Zhejiang",
    rating: 4.8,
    priceRange: "¥80-150",
    distance: "500m",
    tags: ["Local Cuisine", "Elegant Atmosphere"],
    description:
      "Authentic Jiangsu-Zhejiang flavors, locally sourced ingredients, traditional cooking. Signature dishes: Braised Pork, Steamed Sea Bass.",
  },
  {
    id: "r2",
    name: "Sichuan House",
    cuisine: "Sichuan",
    rating: 4.6,
    priceRange: "¥60-120",
    distance: "800m",
    tags: ["Spicy & Flavorful", "Great Value"],
    description:
      "Authentic Sichuan cuisine, spicy and aromatic. Recommended: Sliced Fish in Hot Chili Oil, Mapo Tofu, Twice-Cooked Pork.",
  },
  {
    id: "r3",
    name: "Sakura Japanese",
    cuisine: "Japanese",
    rating: 4.9,
    priceRange: "¥150-300",
    distance: "1.2km",
    tags: ["Exquisite Cuisine", "Date Night"],
    description:
      "Fresh sashimi, exquisite sushi, fusion of traditional and modern Japanese. Chef from Tokyo Ginza.",
  },
  {
    id: "r4",
    name: "Italian Garden",
    cuisine: "Western",
    rating: 4.5,
    priceRange: "¥120-250",
    distance: "900m",
    tags: ["Romantic Atmosphere", "Handmade Pasta"],
    description:
      "Authentic Italian flavors, handmade pasta, imported ingredients. Signature: Creamy Mushroom Pasta, Tiramisu.",
  },
];

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    typing: false,
    contentRender(content: ContentType | string) {
      if (!content || typeof content === "string") return null;

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
  setup(props: any, { slots }: any) {
    return () => {
      const content = props.text || slots.default?.();
      if (!content) return null;

      const styleMap: Record<string, any> = {
        h1: { fontSize: "20px", fontWeight: 700, margin: "0 0 12px" },
        h2: { fontSize: "17px", fontWeight: 600, margin: "0 0 8px" },
        h3: { fontSize: "15px", fontWeight: 600, margin: "0 0 6px" },
        body: { fontSize: "14px", margin: 0 },
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
      const style = styleMap[props.variant ?? "body"] ?? styleMap.body;
      const finalStyle = props.status === "success" ? styleMap.success : style;
      return <p style={finalStyle}>{content}</p>;
    };
  },
};

// ─── LoadingProgress ────────────────────────────────────────────────────────
const LoadingProgress = {
  name: "LoadingProgress",
  props: {
    percent: { type: [Number, String], default: 0 },
    status: { type: String, default: "active" },
    text: { type: String, default: "" },
  },
  setup(props: any) {
    return () => {
      const numericPercent =
        typeof props.percent === "string" ? parseFloat(props.percent) : props.percent;
      return (
        <div
          style={{
            padding: "16px 20px",
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
            marginBottom: "16px",
            minWidth: "320px",
            maxWidth: "480px",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: "13px" }}>
              {props.text || "Loading recommendations..."}
            </Typography.Text>
            <Typography.Text style={{ fontSize: "13px", fontWeight: 500 }}>
              {Math.round(numericPercent)}%
            </Typography.Text>
          </div>
          <Progress
            percent={numericPercent}
            status={props.status as any}
            showInfo={false}
            strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
          />
        </div>
      );
    };
  },
};

// ─── RestaurantCard ─────────────────────────────────────────────────────────
const RestaurantCard = {
  name: "RestaurantCard",
  props: {
    restaurant: { type: Object, default: undefined },
    index: { type: Number, default: 0 },
    isLoading: { type: Boolean, default: false },
  },
  setup(props: any) {
    const visible = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    onMounted(() => {
      if (!props.isLoading && props.restaurant) {
        timer = setTimeout(() => {
          visible.value = true;
        }, (props.index || 0) * 200);
      }
    });

    onUnmounted(() => {
      if (timer) clearTimeout(timer);
    });

    return () => {
      if (props.isLoading) {
        return (
          <Card style={{ width: "100%", borderRadius: "12px", opacity: 0.6 }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <Spin tip="Loading..." />
            </div>
          </Card>
        );
      }

      const r = props.restaurant as RestaurantItem | undefined;
      if (!r) return null;

      return (
        <Card
          style={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            opacity: visible.value ? 1 : 0,
            transform: visible.value ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.4s ease-out",
            marginBottom: "12px",
          }}
          bodyStyle={{ padding: "16px 20px" }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "28px",
              }}
            >
              🍽️
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <Typography.Text strong style={{ fontSize: "16px" }}>
                  {r.name}
                </Typography.Text>
                <Tag color="blue" style={{ margin: 0 }}>
                  {r.cuisine}
                </Tag>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "6px",
                }}
              >
                <Rate disabled value={r.rating} style={{ fontSize: "12px" }} />
                <Typography.Text style={{ fontSize: "13px", color: "#faad14" }}>
                  {r.rating}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                  | {r.distance}
                </Typography.Text>
                <Typography.Text style={{ fontSize: "13px", color: "#52c41a" }}>
                  {r.priceRange}
                </Typography.Text>
              </div>

              <Typography.Text
                type="secondary"
                style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}
                ellipsis
              >
                {r.description}
              </Typography.Text>

              <div style={{ display: "flex", gap: "6px" }}>
                {r.tags.map((tag, i) => (
                  <Tag
                    key={i}
                    style={{
                      fontSize: "11px",
                      borderRadius: "6px",
                      background: "#f5f5f5",
                      border: "none",
                      margin: 0,
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>
      );
    };
  },
};

// ─── RestaurantList ─────────────────────────────────────────────────────────
const RestaurantList = {
  name: "RestaurantList",
  props: {
    restaurants: { type: [Array, String], default: () => [] },
    loadingProgress: { type: [Number, String], default: 0 },
    isStreaming: { type: [Boolean, String], default: false },
  },
  setup(props: any) {
    return () => {
      // v0.8: dataModel stores values as strings, parse them
      const parsedRestaurants: RestaurantItem[] = (() => {
        if (typeof props.restaurants === "string") {
          try {
            return JSON.parse(props.restaurants);
          }
          catch {
            return [];
          }
        }
        return Array.isArray(props.restaurants) ? props.restaurants : [];
      })();

      const numericProgress =
        typeof props.loadingProgress === "string"
          ? parseFloat(props.loadingProgress)
          : props.loadingProgress;

      const boolStreaming =
        typeof props.isStreaming === "string"
          ? props.isStreaming === "true"
          : props.isStreaming;

      const visibleRestaurants = boolStreaming
        ? parsedRestaurants.slice(
            0,
            Math.ceil((numericProgress / 100) * parsedRestaurants.length),
          )
        : parsedRestaurants;

      const Lp: any = LoadingProgress;
      const Rc: any = RestaurantCard;

      return (
        <div style={{ minWidth: "320px", maxWidth: "480px" }}>
          {boolStreaming && numericProgress < 100 && (
            <Lp
              percent={numericProgress}
              text="AI is filtering recommendations for you..."
            />
          )}

          <div>
            {visibleRestaurants.map((item: any, index: number) => (
              <Rc
                key={item?.id ?? index}
                restaurant={item}
                index={index}
                isLoading={false}
              />
            ))}
          </div>

          {!boolStreaming && parsedRestaurants.length > 0 && (
            <div style={{ textAlign: "center", padding: "12px 0", opacity: 0.8 }}>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                ✅ Recommended {parsedRestaurants.length} restaurants for you
              </Typography.Text>
            </div>
          )}
        </div>
      );
    };
  },
};

// ─── Container ──────────────────────────────────────────────────────────────
const Container = {
  name: "DemoContainer",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "20px 20px 16px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBlock: "16px",
          minWidth: "320px",
          maxWidth: "520px",
        }}
      >
        {slots.default?.()}
      </div>
    );
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
    }, 80);
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

function useProgress() {
  const progress = ref(0);
  const progressStatus = ref<"active" | "success">("active");
  let timer: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    progress.value = 0;
    progressStatus.value = "active";
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (progress.value >= 100) {
        if (timer) clearInterval(timer);
        progressStatus.value = "success";
        progress.value = 100;
        return;
      }
      const increment = Math.random() * 8 + 2;
      progress.value = Math.min(progress.value + increment, 100);
    }, 150);
  };

  const reset = () => {
    if (timer) clearInterval(timer);
    timer = null;
    progress.value = 0;
    progressStatus.value = "active";
  };

  return { progress, progressStatus, start, reset };
}

const INTRO_TEXT = `Hello! I'm your food recommendation assistant 🍽️

Based on your location and preferences, I'm filtering the best restaurants nearby...

Here are my recommendation criteria:

1. **Distance First**: Prioritize restaurants within 15 minutes walking distance
2. **Quality Guaranteed**: Select top-rated restaurants with 4.5+ ratings
3. **Diverse Flavors**: Covering Chinese, Japanese, Western and more cuisines

Generating personalized recommendations for you...`;

// ═══════════════════════════════════════════════════════════════════════════
// v0.8 Agent Command definitions
// ═══════════════════════════════════════════════════════════════════════════

const createProgressCommand = (percent: number) => ({
  dataModelUpdate: {
    surfaceId: "recommendation",
    contents: [{ key: "progress", valueString: String(percent) }],
  },
});

const createRestaurantCommand = (restaurants: RestaurantItem[]) => ({
  dataModelUpdate: {
    surfaceId: "recommendation",
    contents: [
      {
        key: "restaurants",
        valueString: JSON.stringify(
          restaurants.map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine,
            rating: r.rating,
            priceRange: r.priceRange,
            distance: r.distance,
            description: r.description,
            tags: r.tags,
          })),
        ),
      },
    ],
  },
});

const SurfaceUpdateCommand = {
  surfaceUpdate: {
    surfaceId: "recommendation",
    components: [
      {
        id: "title",
        component: {
          Text: {
            text: { literalString: "AI Food Recommendations" },
            variant: { literalString: "h1" },
          },
        },
      },
      {
        id: "progress",
        component: {
          LoadingProgress: {
            percent: { path: "/progress" },
            status: { literalString: "active" },
          },
        },
      },
      {
        id: "restaurant-list",
        component: {
          RestaurantList: {
            restaurants: { path: "/restaurants" },
            loadingProgress: { path: "/progress" },
            isStreaming: { path: "/isStreaming" },
          },
        },
      },
      {
        id: "root",
        component: {
          Container: {
            children: { explicitList: ["title", "progress", "restaurant-list"] },
          },
        },
      },
    ],
  },
};

const BeginRenderingCommand = {
  beginRendering: {
    surfaceId: "recommendation",
    root: "root",
  },
};

// ─── App state ──────────────────────────────────────────────────────────────
const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);
const loadedRestaurants = ref<RestaurantItem[]>([]);

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
  // eslint-disable-next-line no-console
  console.log("Action:", payload);
};

const {
  text: streamText,
  streamStatus,
  timestamp: textTimestamp,
  run: runStream,
  reset: resetStream,
} = useStreamText(INTRO_TEXT);

const { progress, progressStatus, start: startProgress, reset: resetProgress } = useProgress();

const handleReload = () => {
  resetStream();
  resetProgress();
  loadedRestaurants.value = [];

  commandQueue.value = [
    ...commandQueue.value,
    { deleteSurface: { surfaceId: "recommendation" } },
  ];
  card.value = [];

  setTimeout(() => {
    sessionKey.value += 1;
    runStream();
  }, 50);
};

const items = computed(() => [
  (() => {
    const textNodes = [{ text: streamText.value, timestamp: textTimestamp.value }].filter(
      item => item.timestamp !== 0,
    );
    const hasRenderableContent = textNodes.length > 0 || card.value.length > 0;
    return {
      content: hasRenderableContent
        ? ({ texts: textNodes, card: card.value } as ContentType)
        : "",
      typing: false,
      role: "assistant",
      key: sessionKey.value,
    };
  })(),
]);

onMounted(() => {
  runStream();
});

watch(
  () => streamStatus.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(SurfaceUpdateCommand);
      onAgentCommand({
        dataModelUpdate: {
          surfaceId: "recommendation",
          contents: [
            { key: "isStreaming", valueString: "true" },
            { key: "restaurants", valueString: "[]" },
          ],
        },
      });
      onAgentCommand(BeginRenderingCommand);
      startProgress();
    }
  },
);

watch(
  () => progress.value,
  value => {
    if (value > 0 && progressStatus.value === "active") {
      onAgentCommand(createProgressCommand(value));

      const visibleCount = Math.ceil((value / 100) * RESTAURANT_DATA.length);
      const newRestaurants = RESTAURANT_DATA.slice(0, visibleCount);

      if (newRestaurants.length !== loadedRestaurants.value.length) {
        loadedRestaurants.value = newRestaurants;
        onAgentCommand(createRestaurantCommand(newRestaurants));
      }
    }
  },
);

watch(
  () => progressStatus.value,
  value => {
    if (value === "success" && loadedRestaurants.value.length === RESTAURANT_DATA.length) {
      onAgentCommand({
        dataModelUpdate: {
          surfaceId: "recommendation",
          contents: [{ key: "isStreaming", valueString: "false" }],
        },
      });
    }
  },
);

const components = {
  Text,
  LoadingProgress,
  RestaurantCard,
  RestaurantList,
  Container,
};
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <Button type="primary" :icon="h(ReloadOutlined)" @click="handleReload">
        Refresh Recommendations
      </Button>
    </div>

    <XCardBox
      :key="sessionKey"
      :commands="commandQueue"
      :on-action="handleAction"
      :components="components"
    >
      <BubbleList :items="items" style="height: 800px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.8 协议的流式渲染示例。演示了如何通过 `dataModelUpdate` 命令实现数据的流式追加更新，模拟实时数据流场景。
</docs>

<docs lang="en-US">
Streaming rendering example of implementing A2UI v0.8 protocol with XCard. Demonstrates how to implement progressive data appending updates through `dataModelUpdate` commands, simulating real-time data stream scenarios.
</docs>
