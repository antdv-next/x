<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { ReloadOutlined, SearchOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Button,
  Card,
  CardMeta,
  Checkbox,
  CheckboxGroup,
  Col,
  Input,
  Rate,
  Row,
  Slider,
  Space,
  Tag,
  Typography,
} from "antdv-next";
import { computed, h, onMounted, onUnmounted, ref, watch } from "vue";

import {
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";

const { Title: TitleText, Text: TypographyText } = Typography;

const contentHeader =
  "Welcome to Product Search! 🔍\n\nFind the perfect product by filtering by category, price, and rating. Results will update in real-time as you adjust filters.";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  tags: string[];
}

const allProducts: Product[] = [
  { id: 1, name: "Wireless Bluetooth Earphones", category: "Electronics", price: 299, rating: 4.5, stock: 156, tags: ["Hot", "Wireless"] },
  { id: 2, name: "Mechanical Keyboard RGB", category: "Electronics", price: 459, rating: 4.8, stock: 89, tags: ["Gaming"] },
  { id: 3, name: "Smart Watch Pro", category: "Wearable", price: 1299, rating: 4.7, stock: 45, tags: ["New", "Smart"] },
  { id: 4, name: "Portable Power Bank", category: "Accessories", price: 99, rating: 4.2, stock: 234, tags: ["Portable"] },
  { id: 5, name: "Noise Cancelling Headphones", category: "Electronics", price: 899, rating: 4.9, stock: 67, tags: ["Premium", "Hot"] },
  { id: 6, name: "Wireless Charger Pad", category: "Accessories", price: 149, rating: 4.3, stock: 178, tags: ["Wireless"] },
  { id: 7, name: "Smart Speaker Mini", category: "Home", price: 399, rating: 4.4, stock: 112, tags: ["Smart Home"] },
  { id: 8, name: "Fitness Tracker Band", category: "Wearable", price: 199, rating: 4.1, stock: 256, tags: ["Fitness"] },
  { id: 9, name: "USB-C Hub Multiport", category: "Accessories", price: 249, rating: 4.6, stock: 143, tags: ["Hot"] },
  { id: 10, name: "Gaming Mouse Pro", category: "Electronics", price: 399, rating: 4.7, stock: 98, tags: ["Gaming", "RGB"] },
];

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

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

interface Filters {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  searchKeyword: string;
}

// v0.8: dataModel stores values as strings, parse them
function parseJsonString<T>(val: any, fallback: T): T {
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val ?? fallback;
}

function normalizeFilters(input: any): Filters {
  if (!input) {
    return { categories: [], priceRange: [0, 1500], minRating: 0, searchKeyword: "" };
  }
  if (typeof input === "string") {
    return parseJsonString<Filters>(input, {
      categories: [],
      priceRange: [0, 1500],
      minRating: 0,
      searchKeyword: "",
    });
  }
  return {
    categories: parseJsonString<string[]>(input.categories, []),
    priceRange: parseJsonString<[number, number]>(input.priceRange, [0, 1500]),
    minRating:
      typeof input.minRating === "string"
        ? parseFloat(input.minRating) || 0
        : (input.minRating ?? 0),
    searchKeyword:
      typeof input.searchKeyword === "string"
        ? input.searchKeyword
        : String(input.searchKeyword ?? ""),
  };
}

// ─── FilterPanel ────────────────────────────────────────────────────────────
const FilterPanel = {
  name: "FilterPanel",
  props: {
    categories: { type: Array, default: () => ["Electronics", "Wearable", "Accessories", "Home"] },
    selectedCategories: { type: [Array, String], default: () => [] },
    priceRange: { type: [Array, String], default: () => [0, 1500] },
    minRating: { type: [Number, String], default: 0 },
    searchKeyword: { type: String, default: "" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props: any) {
    const filters = ref<Filters>(
      normalizeFilters({
        categories: props.selectedCategories,
        priceRange: props.priceRange,
        minRating: props.minRating,
        searchKeyword: props.searchKeyword,
      }),
    );

    // Sync from props when external dataModel updates
    watch(
      () => [
        props.selectedCategories,
        props.priceRange,
        props.minRating,
        props.searchKeyword,
      ],
      () => {
        filters.value = normalizeFilters({
          categories: props.selectedCategories,
          priceRange: props.priceRange,
          minRating: props.minRating,
          searchKeyword: props.searchKeyword,
        });
      },
    );

    const emitChange = () => {
      if (!props.action?.name) return;
      const context: Record<string, any> = {};
      if (Array.isArray(props.action.context)) {
        props.action.context.forEach((item: any) => {
          context[item.key] = filters.value;
        });
      }
      props.onAction?.(props.action.name, context);
    };

    const updateField = (patch: Partial<Filters>) => {
      filters.value = { ...filters.value, ...patch };
      emitChange();
    };

    return () => {
      const categories = props.categories as string[];

      return (
        <Card
          title={
            <Space>
              {h(SearchOutlined)}
              <span>Filters</span>
            </Space>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={20}>
            <div>
              <TypographyText strong style={{ display: "block", marginBottom: "8px" }}>
                Search
              </TypographyText>
              <Input
                placeholder="Search products..."
                prefix={h(SearchOutlined)}
                value={filters.value.searchKeyword}
                onChange={(e: any) =>
                  updateField({ searchKeyword: e?.target?.value ?? "" })}
                allowClear
              />
            </div>

            <div>
              <TypographyText strong style={{ display: "block", marginBottom: "8px" }}>
                Category
              </TypographyText>
              <CheckboxGroup
                value={filters.value.categories}
                onChange={(checked: any) =>
                  updateField({ categories: checked as string[] })}
              >
                <Row>
                  {categories.map(cat => (
                    <Col span={12} key={cat} style={{ marginBottom: "8px" }}>
                      <Checkbox value={cat}>{cat}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </CheckboxGroup>
            </div>

            <div>
              <TypographyText strong style={{ display: "block", marginBottom: "8px" }}>
                Price Range: ¥{filters.value.priceRange[0]} - ¥{filters.value.priceRange[1]}
              </TypographyText>
              <Slider
                range
                min={0}
                max={1500}
                value={filters.value.priceRange}
                onChange={(value: any) =>
                  updateField({ priceRange: value as [number, number] })}
                marks={{ 0: "¥0", 500: "¥500", 1000: "¥1000", 1500: "¥1500" }}
              />
            </div>

            <div>
              <TypographyText strong style={{ display: "block", marginBottom: "8px" }}>
                Minimum Rating
              </TypographyText>
              <Rate
                value={filters.value.minRating}
                onChange={(value: any) => updateField({ minRating: Number(value) || 0 })}
              />
              <TypographyText type="secondary" style={{ marginLeft: "8px" }}>
                {filters.value.minRating > 0
                  ? `${filters.value.minRating}+ stars`
                  : "All ratings"}
              </TypographyText>
            </div>
          </Space>
        </Card>
      );
    };
  },
};

// ─── ProductList ────────────────────────────────────────────────────────────
const ProductList = {
  name: "ProductList",
  props: {
    products: { type: [Array, String], default: () => allProducts },
    filters: { type: [Object, String], default: undefined },
  },
  setup(props: any) {
    const filteredProducts = ref<Product[]>(allProducts);
    const loading = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const recompute = () => {
      loading.value = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        let result = parseJsonString<Product[]>(props.products, allProducts);
        const filters = normalizeFilters(props.filters);

        if (filters.searchKeyword) {
          const keyword = filters.searchKeyword.toLowerCase();
          result = result.filter(
            p =>
              p.name.toLowerCase().includes(keyword) ||
              p.category.toLowerCase().includes(keyword) ||
              p.tags.some(t => t.toLowerCase().includes(keyword)),
          );
        }
        if (filters.categories && filters.categories.length > 0) {
          result = result.filter(p => filters.categories.includes(p.category));
        }
        if (filters.priceRange) {
          result = result.filter(
            p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
          );
        }
        if (filters.minRating > 0) {
          result = result.filter(p => p.rating >= filters.minRating);
        }

        filteredProducts.value = result;
        loading.value = false;
      }, 300);
    };

    watch(
      () => [props.products, props.filters],
      () => recompute(),
      { immediate: true, deep: true },
    );

    onUnmounted(() => {
      if (timer) clearTimeout(timer);
    });

    return () => (
      <div>
        <div style={{ marginBottom: "16px" }}>
          <Space>
            <TypographyText strong>Results:</TypographyText>
            <Tag color="blue">{filteredProducts.value.length} products</Tag>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {filteredProducts.value.map(product => (
            <Col xs={24} sm={12} key={product.id}>
              <Card
                hoverable
                style={{ borderRadius: "12px" }}
                cover={
                  <div
                    style={{
                      height: "120px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: "48px" }}>📦</span>
                  </div>
                }
              >
                <CardMeta
                  title={
                    <Space direction="vertical" size={4} style={{ width: "100%" }}>
                      <TypographyText strong ellipsis style={{ fontSize: "14px" }}>
                        {product.name}
                      </TypographyText>
                      <Space wrap size={4}>
                        {product.tags.map(tag => (
                          <Tag key={tag} style={{ fontSize: "11px", margin: 0 }}>
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%", marginTop: "8px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <TypographyText strong style={{ fontSize: "16px", color: "#1890ff" }}>
                          ¥{product.price}
                        </TypographyText>
                        <Rate disabled value={product.rating} style={{ fontSize: "12px" }} />
                      </div>
                      <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                        Stock: {product.stock}
                      </TypographyText>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>

        {filteredProducts.value.length === 0 && !loading.value && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
            <TitleText level={4} type="secondary">
              No products found
            </TitleText>
            <TypographyText type="secondary">Try adjusting your filters</TypographyText>
          </div>
        )}
      </div>
    );
  },
};

// ─── ColWrapper ─────────────────────────────────────────────────────────────
const ColWrapper = {
  name: "ColWrapper",
  props: {
    span: { type: [Number, String], default: 8 },
  },
  setup(props: any, { slots }: any) {
    return () => {
      const numSpan = typeof props.span === "string" ? parseInt(props.span, 10) : props.span;
      return <Col span={numSpan}>{slots.default?.()}</Col>;
    };
  },
};

// ─── FilterContainer ────────────────────────────────────────────────────────
const FilterContainer = {
  name: "FilterContainer",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "20px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          minWidth: "600px",
        }}
      >
        <Row gutter={24} align="top">
          {slots.default?.()}
        </Row>
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
const FilterSurfaceUpdateCommand = {
  surfaceUpdate: {
    surfaceId: "filter",
    components: [
      {
        id: "filter-panel",
        component: {
          FilterPanel: {
            selectedCategories: { path: "/filters/categories" },
            priceRange: { path: "/filters/priceRange" },
            minRating: { path: "/filters/minRating" },
            searchKeyword: { path: "/filters/searchKeyword" },
            action: {
              name: "update_filters",
              context: [{ key: "filters", value: { path: "/filters" } }],
            },
          },
        },
      },
      {
        id: "product-list",
        component: {
          ProductList: {
            filters: { path: "/filters" },
          },
        },
      },
      {
        id: "col-filter",
        component: {
          ColWrapper: {
            span: { literalString: "8" },
            child: "filter-panel",
          },
        },
      },
      {
        id: "col-products",
        component: {
          ColWrapper: {
            span: { literalString: "16" },
            child: "product-list",
          },
        },
      },
      {
        id: "root",
        component: {
          FilterContainer: {
            children: { explicitList: ["col-filter", "col-products"] },
          },
        },
      },
    ],
  },
};

const FilterDataModelUpdateCommand = {
  dataModelUpdate: {
    surfaceId: "filter",
    contents: [
      {
        key: "filters",
        valueMap: [
          { key: "categories", valueString: "[]" },
          { key: "priceRange", valueString: "[0,1500]" },
          { key: "minRating", valueString: "0" },
          { key: "searchKeyword", valueString: "" },
        ],
      },
    ],
  },
};

const FilterBeginRenderingCommand = {
  beginRendering: { surfaceId: "filter", root: "root" },
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
  if (payload.name === "update_filters") {
    const { filters } = payload.context || {};
    if (filters) {
      onAgentCommand({
        dataModelUpdate: {
          surfaceId: "filter",
          contents: [
            {
              key: "filters",
              valueMap: [
                {
                  key: "categories",
                  valueString: JSON.stringify(filters.categories || []),
                },
                {
                  key: "priceRange",
                  valueString: JSON.stringify(filters.priceRange || [0, 1500]),
                },
                { key: "minRating", valueString: String(filters.minRating || 0) },
                { key: "searchKeyword", valueString: filters.searchKeyword || "" },
              ],
            },
          ],
        },
      });
    }
  }
};

const {
  text: textHeader,
  streamStatus: streamStatusHeader,
  timestamp: timestampHeader,
  run: runHeader,
  reset: resetHeader,
} = useStreamText(contentHeader);

const handleReload = () => {
  resetHeader();
  commandQueue.value = [
    ...commandQueue.value,
    { deleteSurface: { surfaceId: "filter" } },
  ];
  card.value = [];
  setTimeout(() => {
    sessionKey.value += 1;
    runHeader();
  }, 50);
};

const items = computed(() => [
  (() => {
    const textNodes = [{ text: textHeader.value, timestamp: timestampHeader.value }].filter(
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
  runHeader();
});

watch(
  () => streamStatusHeader.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(FilterSurfaceUpdateCommand);
      onAgentCommand(FilterDataModelUpdateCommand);
      onAgentCommand(FilterBeginRenderingCommand);
    }
  },
);

const components = {
  FilterPanel,
  ProductList,
  FilterContainer,
  ColWrapper,
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
      <BubbleList :items="items" style="height: 700px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.8 协议的动态数据筛选与搜索示例。演示了如何使用 antd 组件实现实时搜索、多条件筛选和结果动态更新。
</docs>

<docs lang="en-US">
Dynamic data filtering and search example implementing A2UI v0.8 protocol with XCard. Demonstrates how to use antd components to implement real-time search, multi-condition filtering, and dynamic result updates.
</docs>
