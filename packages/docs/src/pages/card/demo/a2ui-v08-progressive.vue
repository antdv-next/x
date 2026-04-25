<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Badge, Button, Card, Progress, Space, Tag, Typography } from "antdv-next";
import { computed, h, onMounted, onUnmounted, ref, watch } from "vue";

import { XCardBox, XCardCard } from "@antdv-next/x-card";

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  tag?: string;
}

const allProducts: Product[][] = [
  [
    { id: 1, name: "Wireless Bluetooth Earphones", price: 299, category: "Digital", stock: 156, tag: "Hot" },
    { id: 2, name: "Mechanical Keyboard", price: 459, category: "Digital", stock: 89 },
  ],
  [
    { id: 3, name: "Smart Watch", price: 1299, category: "Wearable", stock: 45, tag: "New" },
    { id: 4, name: "Portable Power Bank", price: 99, category: "Accessories", stock: 234 },
  ],
  [
    { id: 5, name: "Noise Cancelling Headphones", price: 899, category: "Digital", stock: 67, tag: "Recommended" },
    { id: 6, name: "Wireless Charger", price: 149, category: "Accessories", stock: 178 },
  ],
  [
    { id: 7, name: "Smart Speaker", price: 399, category: "Home", stock: 112, tag: "Hot" },
    { id: 8, name: "Fitness Tracker", price: 199, category: "Wearable", stock: 256 },
  ],
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

// ─── ProductCard ────────────────────────────────────────────────────────────
const ProductCard = {
  name: "ProductCard",
  props: {
    name: { type: String, default: "" },
    price: { type: [String, Number], default: 0 },
    category: { type: String, default: "" },
    stock: { type: [String, Number], default: 0 },
    tag: { type: String, default: "" },
    index: { type: [String, Number], default: 0 },
  },
  setup(props: any) {
    const visible = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    onMounted(() => {
      const idx = typeof props.index === "string" ? Number(props.index) : props.index;
      timer = setTimeout(() => {
        visible.value = true;
      }, (idx || 0) * 150);
    });

    onUnmounted(() => {
      if (timer) clearTimeout(timer);
    });

    return () => {
      const numPrice = typeof props.price === "string" ? Number(props.price) : props.price;
      const numStock = typeof props.stock === "string" ? Number(props.stock) : props.stock;

      return (
        <Card
          hoverable
          style={{
            width: "100%",
            maxWidth: "320px",
            borderRadius: "12px",
            overflow: "hidden",
            opacity: visible.value ? 1 : 0,
            transform: visible.value ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "1px solid #f0f0f0",
          }}
          bodyStyle={{ padding: "16px" }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography.Text
                strong
                style={{ fontSize: "16px", color: "#1a1a1a", flex: 1, lineHeight: "22px" }}
              >
                {props.name}
              </Typography.Text>
              {props.tag && (
                <Tag
                  color="orange"
                  style={{
                    fontSize: "11px",
                    padding: "0 8px",
                    lineHeight: "20px",
                    borderRadius: "8px",
                    margin: 0,
                  }}
                >
                  {props.tag}
                </Tag>
              )}
            </div>

            <div>
              <Typography.Text style={{ fontSize: "20px", fontWeight: 700, color: "#ff4d4f" }}>
                ¥{numPrice}
              </Typography.Text>
            </div>

            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <Badge
                color="blue"
                text={
                  <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                    {props.category}
                  </Typography.Text>
                }
              />
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                Stock: {numStock}
              </Typography.Text>
            </div>
          </Space>
        </Card>
      );
    };
  },
};

// ─── ProductContainer ───────────────────────────────────────────────────────
const ProductContainer = {
  name: "ProductContainer",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #e8e8e8",
          padding: "20px",
          background: "#fafafa",
          minWidth: "320px",
          maxWidth: "720px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {slots.default?.()}
        </div>
      </div>
    );
  },
};

// ─── LoadingIndicator ───────────────────────────────────────────────────────
const LoadingIndicator = {
  name: "LoadingIndicator",
  props: {
    progress: { type: [String, Number], default: 0 },
    total: { type: [String, Number], default: 100 },
    loading: { type: [String, Boolean], default: false },
  },
  setup(props: any) {
    return () => {
      const numProgress =
        typeof props.progress === "string" ? Number(props.progress) : props.progress;
      const numTotal = typeof props.total === "string" ? Number(props.total) : props.total;
      const boolLoading =
        typeof props.loading === "string" ? props.loading === "true" : props.loading;
      const percent = Math.round((numProgress / numTotal) * 100);

      return (
        <div
          style={{
            padding: "16px 20px",
            background: "#fff",
            borderRadius: "12px",
            marginBlock: "16px",
            border: "1px solid #e8e8e8",
            minWidth: "320px",
            maxWidth: "720px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography.Text style={{ fontSize: "14px", fontWeight: 500 }}>
                {boolLoading ? "Loading product data..." : "Loading complete"}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                {numProgress}/{numTotal} products
              </Typography.Text>
            </div>
            <Progress
              percent={percent}
              status={boolLoading ? "active" : "success"}
              strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
              showInfo={false}
            />
          </Space>
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
const CreateLoadingIndicatorSurface = {
  surfaceUpdate: {
    surfaceId: "loading-indicator",
    components: [
      {
        id: "root",
        component: {
          LoadingIndicator: {
            progress: { literalString: "0" },
            total: { literalString: "8" },
            loading: { literalString: "true" },
          },
        },
      },
    ],
  },
};

const BeginLoadingIndicator = {
  beginRendering: {
    surfaceId: "loading-indicator",
    root: "root",
  },
};

const UpdateLoadingIndicator = (progress: number, total: number, loading: boolean) => ({
  surfaceUpdate: {
    surfaceId: "loading-indicator",
    components: [
      {
        id: "root",
        component: {
          LoadingIndicator: {
            progress: { literalString: String(progress) },
            total: { literalString: String(total) },
            loading: { literalString: String(loading) },
          },
        },
      },
    ],
  },
});

const DeleteLoadingIndicator = {
  deleteSurface: {
    surfaceId: "loading-indicator",
  },
};

const CreateProductSurface = (products: Product[]) => {
  const productComponents = products.map((product, idx) => ({
    id: `product-${product.id}`,
    component: {
      ProductCard: {
        name: { literalString: product.name },
        price: { literalString: String(product.price) },
        category: { literalString: product.category },
        stock: { literalString: String(product.stock) },
        ...(product.tag ? { tag: { literalString: product.tag } } : {}),
        index: { literalString: String(idx) },
      },
    },
  }));

  return {
    surfaceUpdate: {
      surfaceId: "progressive-demo",
      components: [
        ...productComponents,
        {
          id: "root",
          component: {
            ProductContainer: {
              children: { explicitList: products.map(p => `product-${p.id}`) },
            },
          },
        },
      ],
    },
  };
};

const BeginProductSurface = {
  beginRendering: {
    surfaceId: "progressive-demo",
    root: "root",
  },
};

const DeleteProductSurface = {
  deleteSurface: {
    surfaceId: "progressive-demo",
  },
};

// ─── App state ──────────────────────────────────────────────────────────────
const welcomeText =
  "🎉 Welcome to the progressive product showcase!\n\nProduct data will be loaded in batches, 2 products at a time. You can observe how components are displayed progressively.";
const completeText = "✅ All products loaded! Total 8 products loaded.";

const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);

let loadingTimer: ReturnType<typeof setTimeout> | null = null;
const batchCount = ref(0);

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

const {
  text: textHeader,
  streamStatus: streamStatusHeader,
  timestamp: timestampHeader,
  run: runHeader,
  reset: resetHeader,
} = useStreamText(welcomeText);

const {
  text: textFooter,
  timestamp: timestampFooter,
  run: runFooter,
  reset: resetFooter,
} = useStreamText(completeText);

const startProgressiveLoading = () => {
  batchCount.value = 0;
  const loadedProducts: Product[] = [];

  const loadNextBatch = () => {
    if (batchCount.value >= allProducts.length) {
      onAgentCommand(UpdateLoadingIndicator(8, 8, false));
      setTimeout(() => runFooter(), 500);
      return;
    }

    const currentProducts = allProducts[batchCount.value] ?? [];
    loadedProducts.push(...currentProducts);

    const progress = (batchCount.value + 1) * 2;
    onAgentCommand(UpdateLoadingIndicator(progress, 8, true));

    setTimeout(() => {
      onAgentCommand(CreateProductSurface([...loadedProducts]));
    }, 50);

    batchCount.value++;
    loadingTimer = setTimeout(loadNextBatch, 1500);
  };

  loadNextBatch();
};

const handleReload = () => {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }

  resetHeader();
  resetFooter();
  batchCount.value = 0;

  onAgentCommand(DeleteLoadingIndicator);
  onAgentCommand(DeleteProductSurface);

  commandQueue.value = [];
  card.value = [];
  sessionKey.value += 1;
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
        ? ({ texts: textNodes, card: card.value } as ContentType)
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

onUnmounted(() => {
  if (loadingTimer) clearTimeout(loadingTimer);
});

watch(
  () => streamStatusHeader.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(CreateLoadingIndicatorSurface);
      onAgentCommand(BeginLoadingIndicator);
      onAgentCommand(CreateProductSurface([]));
      onAgentCommand(BeginProductSurface);
      startProgressiveLoading();
    }
  },
);

watch(
  () => sessionKey.value,
  () => {
    runHeader();
  },
);

const components = {
  ProductCard,
  ProductContainer,
  LoadingIndicator,
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
      :components="components"
    >
      <BubbleList :items="items" style="height: 800px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.8 协议的渐进式加载示例。演示了如何分批次加载产品数据，并通过 `surfaceUpdate` 命令渐进式更新组件，实现流畅的加载动画效果。
</docs>

<docs lang="en-US">
Progressive loading example of implementing A2UI v0.8 protocol with XCard. Demonstrates how to load product data in batches and progressively update components using `surfaceUpdate` commands to achieve smooth loading animations.
</docs>
