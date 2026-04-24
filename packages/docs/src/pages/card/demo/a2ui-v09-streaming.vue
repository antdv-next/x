<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Card, Progress, Rate, Spin, Tag, Typography } from "antdv-next";
import { computed, h, onMounted, onUnmounted, ref, watch } from "vue";

import {
  registerCatalog,
  XCardBox,
  XCardCard,
} from "@antdv-next/x-card";
import localCatalog from "./catalog-coffee.json";

registerCatalog(localCatalog as any);

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
    tags: ["Local Cuisine", "Elegant Ambiance"],
    description:
      "Authentic Jiangsu-Zhejiang flavors with locally sourced ingredients. Signature dishes: Braised Pork, Steamed Sea Bass.",
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
      "Authentic Sichuan cuisine, spicy and aromatic. Recommended: Boiled Fish, Mapo Tofu, Twice-cooked Pork.",
  },
  {
    id: "r3",
    name: "Sakura Japanese",
    cuisine: "Japanese",
    rating: 4.9,
    priceRange: "¥150-300",
    distance: "1.2km",
    tags: ["Exquisite Cuisine", "Perfect for Dates"],
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
      "Authentic Italian flavors, handmade pasta with imported ingredients. Signature: Creamy Mushroom Pasta, Tiramisu.",
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

const Text = {
  name: "DemoText",
  props: {
    text: { type: String, default: "" },
    variant: { type: String, default: "body" },
    status: { type: String, default: undefined },
  },
  setup(props: any) {
    return () => {
      const content = props.text;
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

const LoadingProgress = {
  name: "LoadingProgress",
  props: {
    percent: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    text: { type: String, default: "" },
  },
  setup(props: any) {
    return () => (
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
            {Math.round(props.percent)}%
          </Typography.Text>
        </div>
        <Progress
          percent={props.percent}
          status={props.status as any}
          showInfo={false}
          strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
        />
      </div>
    );
  },
};

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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Typography.Text strong style={{ fontSize: "16px" }}>
                  {r.name}
                </Typography.Text>
                <Tag color="blue" style={{ margin: 0 }}>
                  {r.cuisine}
                </Tag>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
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

const RestaurantList = {
  name: "RestaurantList",
  props: {
    restaurants: { type: Array, default: () => [] },
    loadingProgress: { type: Number, default: 0 },
    isStreaming: { type: Boolean, default: false },
  },
  setup(props: any) {
    return () => {
      const safe = Array.isArray(props.restaurants) ? props.restaurants : [];
      const visibleRestaurants = props.isStreaming
        ? safe.slice(0, Math.ceil((props.loadingProgress / 100) * safe.length))
        : safe;

      const Lp: any = LoadingProgress;
      const Rc: any = RestaurantCard;

      return (
        <div style={{ minWidth: "320px", maxWidth: "480px" }}>
          {props.isStreaming && props.loadingProgress < 100 && (
            <Lp
              percent={props.loadingProgress}
              text="AI is selecting recommendations for you..."
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

          {!props.isStreaming && safe.length > 0 && (
            <div style={{ textAlign: "center", padding: "12px 0", opacity: 0.8 }}>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                ✅ Recommended {safe.length} restaurants for you
              </Typography.Text>
            </div>
          )}
        </div>
      );
    };
  },
};

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

Based on your location and preferences, I'm selecting the best restaurants nearby for you...

Here are my recommendation criteria:

1. **Distance First**: Prioritizing restaurants within 15 minutes walking distance
2. **Quality Guaranteed**: Selecting only restaurants with ratings above 4.5
3. **Diverse Cuisines**: Covering Chinese, Japanese, Western, and more

Generating personalized recommendations for you...`;

const CreateSurfaceCommand = {
  version: "v0.9",
  createSurface: {
    surfaceId: "recommendation",
    catalogId: "local://coffee_booking_catalog.json",
  },
};

const UpdateComponentsCommand = {
  version: "v0.9",
  updateComponents: {
    surfaceId: "recommendation",
    components: [
      { id: "title", component: "Text", text: "AI Food Recommendations", variant: "h1" },
      {
        id: "progress",
        component: "LoadingProgress",
        percent: { path: "/progress" },
        status: { path: "/progressStatus" },
      },
      {
        id: "restaurant-list",
        component: "RestaurantList",
        restaurants: { path: "/restaurants" },
        loadingProgress: { path: "/progress" },
        isStreaming: { path: "/isStreaming" },
      },
      {
        id: "root",
        component: "Container",
        children: ["title", "progress", "restaurant-list"],
      },
    ],
  },
};

const createProgressUpdateCommand = (percent: number) => ({
  version: "v0.9",
  updateDataModel: {
    surfaceId: "recommendation",
    path: "/progress",
    value: percent,
  },
});

const createRestaurantUpdateCommand = (restaurants: RestaurantItem[]) => ({
  version: "v0.9",
  updateDataModel: {
    surfaceId: "recommendation",
    path: "/restaurants",
    value: restaurants,
  },
});

const createStreamingStatusCommand = (isStreaming: boolean) => ({
  version: "v0.9",
  updateDataModel: {
    surfaceId: "recommendation",
    path: "/isStreaming",
    value: isStreaming,
  },
});

const createProgressStatusCommand = (status: "active" | "success") => ({
  version: "v0.9",
  updateDataModel: {
    surfaceId: "recommendation",
    path: "/progressStatus",
    value: status,
  },
});

const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);
const loadedRestaurants = ref<RestaurantItem[]>([]);

const onAgentCommand = (command: any) => {
  if ("createSurface" in command) {
    const surfaceId = command.createSurface.surfaceId;
    if (!card.value.some(c => c.id === surfaceId)) {
      card.value = [...card.value, { id: surfaceId, timestamp: Date.now() }];
    }
  } else if ("deleteSurface" in command) {
    card.value = card.value.filter(c => c.id !== command.deleteSurface.surfaceId);
  }
  commandQueue.value = [...commandQueue.value, command];
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
    { version: "v0.9", deleteSurface: { surfaceId: "recommendation" } },
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
      onAgentCommand(CreateSurfaceCommand);
      onAgentCommand(UpdateComponentsCommand);
      onAgentCommand(createStreamingStatusCommand(true));
      onAgentCommand(createRestaurantUpdateCommand([]));
      onAgentCommand(createProgressStatusCommand("active"));
      startProgress();
    }
  },
);

watch(
  () => progress.value,
  value => {
    if (value > 0 && progressStatus.value === "active") {
      onAgentCommand(createProgressUpdateCommand(value));

      const visibleCount = Math.ceil((value / 100) * RESTAURANT_DATA.length);
      const newRestaurants = RESTAURANT_DATA.slice(0, visibleCount);

      if (newRestaurants.length !== loadedRestaurants.value.length) {
        loadedRestaurants.value = newRestaurants;
        onAgentCommand(createRestaurantUpdateCommand(newRestaurants));
      }
    }
  },
);

watch(
  () => progressStatus.value,
  value => {
    if (value === "success" && loadedRestaurants.value.length === RESTAURANT_DATA.length) {
      onAgentCommand(createStreamingStatusCommand(false));
      onAgentCommand(createProgressStatusCommand("success"));
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
        Recommend Again
      </Button>
    </div>

    <XCardBox
      :key="sessionKey"
      :commands="commandQueue"
      :components="components"
    >
      <BubbleList :items="items" style="height: 800px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.9 协议的流式内容与实时更新示例。演示了 AI 推荐结果的流式展示、组件逐步加载动画和加载进度指示，配合 catalog 机制。
</docs>

<docs lang="en-US">
Streaming content and real-time updates example implementing A2UI v0.9 protocol with XCard. Demonstrates streaming display of AI recommendation results, progressive component loading animations, and loading progress indicators with catalog mechanism.
</docs>
