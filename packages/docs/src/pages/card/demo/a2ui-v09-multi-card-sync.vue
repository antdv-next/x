<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import { DeleteOutlined, ReloadOutlined, ShoppingCartOutlined } from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  InputNumber,
  Row,
  Space,
  SpaceCompact,
  Tag,
  Typography,
} from "antdv-next";
import { computed, h, onMounted, ref, watch } from "vue";

import {
  registerCatalog,
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";
import localCatalog from "./catalog-coffee.json";

registerCatalog(localCatalog as any);

const { Title: TitleText, Text: TypographyText } = Typography;

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  tag?: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    description: "A17 Pro chip, 48MP camera system",
    price: 7999,
    category: "Electronics",
    tag: "Hot",
    stock: 50,
  },
  {
    id: 2,
    name: "MacBook Air M3",
    description: "M3 chip, 15-inch Liquid Retina display",
    price: 10999,
    category: "Electronics",
    tag: "New",
    stock: 30,
  },
  {
    id: 3,
    name: "AirPods Pro 2",
    description: "Active Noise Cancellation, Adaptive Audio",
    price: 1899,
    category: "Accessories",
    tag: "Popular",
    stock: 100,
  },
  {
    id: 4,
    name: "Apple Watch Ultra 2",
    description: "The most rugged Apple Watch, titanium case",
    price: 6499,
    category: "Wearable",
    stock: 25,
  },
  {
    id: 5,
    name: "iPad Pro M2",
    description: "M2 chip, 12.9-inch Liquid Retina XDR display",
    price: 9299,
    category: "Electronics",
    tag: "Recommended",
    stock: 40,
  },
  {
    id: 6,
    name: "Magic Keyboard",
    description: "Wireless, rechargeable, with Touch ID",
    price: 1999,
    category: "Accessories",
    stock: 80,
  },
];

const contentHeader =
  "Welcome to Smart Shopping Cart! 🛒\n\nBrowse products, add them to your cart, and see real-time price calculations. Experience the power of multi-surface collaboration!";

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

const categoryEmoji = (category: string) => {
  if (category === "Electronics") return "📱";
  if (category === "Accessories") return "🎧";
  if (category === "Wearable") return "⌚";
  return "📦";
};

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

const ProductListCard = {
  name: "ProductListCard",
  props: {
    products: { type: Array, default: () => allProducts },
    cart: { type: Array, default: () => [] },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props: any) {
    const handleAddToCart = (product: Product) => {
      if (!props.action?.event?.name) return;
      props.onAction?.(props.action.event.name, { product });
    };

    const getCartQuantity = (productId: number) => {
      const item = (props.cart as CartItem[]).find(c => c.product.id === productId);
      return item?.quantity || 0;
    };

    return () => {
      const products = (props.products as Product[]) ?? allProducts;
      return (
        <Card
          title={
            <Space>
              <span style={{ fontSize: "18px" }}>📦</span>
              <span>Product List</span>
              <Tag color="blue">{products.length} items</Tag>
            </Space>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            height: "100%",
          }}
          bodyStyle={{ maxHeight: "450px", overflow: "auto" }}
        >
          <div>
            {products.map(product => {
              const inCart = getCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>{categoryEmoji(product.category)}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      <TypographyText strong style={{ fontSize: "14px" }} ellipsis>
                        {product.name}
                      </TypographyText>
                      {product.tag && (
                        <Tag
                          color="orange"
                          style={{
                            fontSize: "11px",
                            padding: "0 6px",
                            lineHeight: "18px",
                            borderRadius: "6px",
                            margin: 0,
                          }}
                        >
                          {product.tag}
                        </Tag>
                      )}
                    </div>
                    <TypographyText type="secondary" style={{ fontSize: "12px" }} ellipsis>
                      {product.description}
                    </TypographyText>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <TypographyText
                      strong
                      style={{ fontSize: "15px", color: "#1890ff", display: "block" }}
                    >
                      ¥{product.price.toLocaleString()}
                    </TypographyText>
                    <Button
                      type={inCart > 0 ? "default" : "primary"}
                      size="small"
                      onClick={() => handleAddToCart(product)}
                      style={{ marginTop: "4px", minWidth: "80px" }}
                    >
                      {inCart > 0 ? (
                        <Badge count={inCart} size="small" offset={[6, -2]}>
                          {h(ShoppingCartOutlined)}
                        </Badge>
                      ) : (
                        h(ShoppingCartOutlined)
                      )}
                      <span style={{ marginLeft: "6px" }}>{inCart > 0 ? "Add More" : "Add"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      );
    };
  },
};

const CartCard = {
  name: "CartCard",
  props: {
    cart: { type: Array, default: () => [] },
    onAction: { type: Function, default: undefined },
    updateAction: { type: Object, default: undefined },
    removeAction: { type: Object, default: undefined },
  },
  setup(props: any) {
    const handleQuantityChange = (productId: number, quantity: number) => {
      if (!props.updateAction?.event?.name) return;
      props.onAction?.(props.updateAction.event.name, { productId, quantity });
    };

    const handleRemove = (productId: number) => {
      if (!props.removeAction?.event?.name) return;
      props.onAction?.(props.removeAction.event.name, { productId });
    };

    return () => {
      const cart = (props.cart as CartItem[]) ?? [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

      return (
        <Card
          title={
            <Space>
              <Badge count={totalItems} size="small" offset={[4, -2]}>
                {h(ShoppingCartOutlined, { style: { fontSize: "18px" } })}
              </Badge>
              <span>Shopping Cart</span>
            </Space>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            height: "100%",
          }}
          bodyStyle={{ maxHeight: "380px", overflow: "auto" }}
        >
          {cart.length === 0 ? (
            <Empty description="Cart is empty" style={{ padding: "40px 0" }} />
          ) : (
            <>
              <div>
                {cart.map(item => (
                  <div
                    key={item.product.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>
                        {categoryEmoji(item.product.category)}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <TypographyText strong style={{ fontSize: "13px" }} ellipsis>
                        {item.product.name}
                      </TypographyText>
                      <TypographyText
                        type="secondary"
                        style={{ fontSize: "12px", display: "block" }}
                      >
                        ¥{item.product.price.toLocaleString()} x {item.quantity}
                      </TypographyText>
                    </div>

                    <SpaceCompact size="small">
                      <InputNumber
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(val: any) =>
                          handleQuantityChange(item.product.id, Number(val) || 1)
                        }
                        style={{ width: "60px" }}
                      />
                      <Button
                        danger
                        onClick={() => handleRemove(item.product.id)}
                      >
                        {h(DeleteOutlined)}
                      </Button>
                    </SpaceCompact>
                  </div>
                ))}
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TypographyText strong>Subtotal:</TypographyText>
                <TypographyText strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  ¥{subtotal.toLocaleString()}
                </TypographyText>
              </div>
            </>
          )}
        </Card>
      );
    };
  },
};

const OrderSummaryCard = {
  name: "OrderSummaryCard",
  props: {
    cart: { type: Array, default: () => [] },
    onAction: { type: Function, default: undefined },
    checkoutAction: { type: Object, default: undefined },
  },
  setup(props: any) {
    return () => {
      const cart = (props.cart as CartItem[]) ?? [];
      const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

      const discount = subtotal >= 10000 ? subtotal * 0.1 : subtotal >= 5000 ? subtotal * 0.05 : 0;
      const discountRate = subtotal >= 10000 ? "10%" : subtotal >= 5000 ? "5%" : "0%";
      const shipping = subtotal >= 1000 ? 0 : 15;
      const total = subtotal - discount + shipping;

      const handleCheckout = () => {
        if (!props.checkoutAction?.event?.name) return;
        props.onAction?.(props.checkoutAction.event.name, {
          cart,
          subtotal,
          discount,
          shipping,
          total,
          itemCount: totalItems,
        });
      };

      return (
        <Card
          title={
            <Space>
              <span style={{ fontSize: "18px" }}>📋</span>
              <span>Order Summary</span>
            </Space>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            background: "linear-gradient(180deg, #fafafa 0%, #ffffff 100%)",
            height: "100%",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TypographyText type="secondary">Items:</TypographyText>
              <TypographyText>{totalItems} items</TypographyText>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TypographyText type="secondary">Subtotal:</TypographyText>
              <TypographyText>¥{subtotal.toLocaleString()}</TypographyText>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Space>
                <TypographyText type="secondary">Discount:</TypographyText>
                {discount > 0 && (
                  <Tag color="green" style={{ margin: 0 }}>
                    {discountRate} off
                  </Tag>
                )}
              </Space>
              <TypographyText type="success">-¥{discount.toLocaleString()}</TypographyText>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TypographyText type="secondary">Shipping:</TypographyText>
              {shipping === 0 ? (
                <TypographyText type="success">Free</TypographyText>
              ) : (
                <TypographyText>¥{shipping}</TypographyText>
              )}
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TitleText level={4} style={{ margin: 0 }}>
                Total:
              </TitleText>
              <TitleText level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                ¥{total.toLocaleString()}
              </TitleText>
            </div>

            {subtotal < 5000 && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#fff7e6",
                  borderRadius: "8px",
                  border: "1px solid #ffd591",
                }}
              >
                <TypographyText style={{ fontSize: "12px", color: "#d46b08" }}>
                  💡 Spend ¥{(5000 - subtotal).toLocaleString()} more for 5% off!
                </TypographyText>
              </div>
            )}
            {subtotal >= 5000 && subtotal < 10000 && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#fff7e6",
                  borderRadius: "8px",
                  border: "1px solid #ffd591",
                }}
              >
                <TypographyText style={{ fontSize: "12px", color: "#d46b08" }}>
                  💡 Spend ¥{(10000 - subtotal).toLocaleString()} more for 10% off!
                </TypographyText>
              </div>
            )}
            {subtotal >= 10000 && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f6ffed",
                  borderRadius: "8px",
                  border: "1px solid #b7eb8f",
                }}
              >
                <TypographyText style={{ fontSize: "12px", color: "#52c41a" }}>
                  🎉 You've got the maximum discount!
                </TypographyText>
              </div>
            )}

            <Button
              type="primary"
              size="large"
              block
              disabled={cart.length === 0}
              onClick={handleCheckout}
              style={{ marginTop: "8px", height: "48px", borderRadius: "8px" }}
            >
              Checkout (¥{total.toLocaleString()})
            </Button>
          </Space>
        </Card>
      );
    };
  },
};

const MultiCardContainer = {
  name: "MultiCardContainer",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "24px",
          background: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Row gutter={16} align="stretch">
          {slots.default?.()}
        </Row>
      </div>
    );
  },
};

const CheckoutSuccessCard = {
  name: "CheckoutSuccessCard",
  props: {
    total: { type: Number, default: 0 },
    itemCount: { type: Number, default: 0 },
    orderNumber: { type: String, default: "" },
  },
  setup(props: any) {
    return () => (
      <Card
        style={{
          borderRadius: "16px",
          background: "linear-gradient(145deg, #52c41a 0%, #73d13d 100%)",
          border: "none",
          boxShadow: "0 8px 24px rgba(82,196,26,0.35)",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: "40px" }}>✅</span>
          </div>

          <TitleText level={3} style={{ color: "#fff", margin: "0 0 8px" }}>
            Order Placed!
          </TitleText>
          <TypographyText
            style={{
              color: "rgba(255,255,255,0.85)",
              display: "block",
              marginBottom: "24px",
            }}
          >
            Thank you for your purchase!
          </TypographyText>

          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <TypographyText style={{ color: "rgba(255,255,255,0.7)" }}>
                Order Number:
              </TypographyText>
              <TypographyText strong style={{ color: "#fff" }}>
                {props.orderNumber}
              </TypographyText>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <TypographyText style={{ color: "rgba(255,255,255,0.7)" }}>Items:</TypographyText>
              <TypographyText style={{ color: "#fff" }}>{props.itemCount} items</TypographyText>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TypographyText style={{ color: "rgba(255,255,255,0.7)" }}>Total:</TypographyText>
              <TypographyText strong style={{ color: "#fff", fontSize: "18px" }}>
                ¥{props.total.toLocaleString()}
              </TypographyText>
            </div>
          </div>
        </div>
      </Card>
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

const CreateShopSurface = {
  version: "v0.9",
  createSurface: {
    surfaceId: "shop",
    catalogId: "local://coffee_booking_catalog.json",
  },
};

const UpdateShopComponents = {
  version: "v0.9",
  updateComponents: {
    surfaceId: "shop",
    components: [
      {
        id: "product-list-card",
        component: "ProductListCard",
        products: { path: "/products" },
        cart: { path: "/cart" },
        action: {
          event: { name: "add_to_cart", context: { product: {} } },
        },
      },
      {
        id: "cart-card",
        component: "CartCard",
        cart: { path: "/cart" },
        updateAction: {
          event: { name: "update_quantity", context: { productId: {}, quantity: {} } },
        },
        removeAction: {
          event: { name: "remove_from_cart", context: { productId: {} } },
        },
      },
      {
        id: "order-summary-card",
        component: "OrderSummaryCard",
        cart: { path: "/cart" },
        checkoutAction: {
          event: { name: "checkout", context: { orderData: {} } },
        },
      },
      {
        id: "col-products",
        component: "ColWrapper",
        span: 8,
        children: ["product-list-card"],
      },
      {
        id: "col-cart",
        component: "ColWrapper",
        span: 8,
        children: ["cart-card"],
      },
      {
        id: "col-summary",
        component: "ColWrapper",
        span: 8,
        children: ["order-summary-card"],
      },
      {
        id: "root",
        component: "MultiCardContainer",
        children: ["col-products", "col-cart", "col-summary"],
      },
    ],
  },
};

const InitDataModel = {
  version: "v0.9",
  updateDataModel: {
    surfaceId: "shop",
    path: "/",
    value: { products: allProducts, cart: [] },
  },
};

const CreateCheckoutSuccessSurface = {
  version: "v0.9",
  createSurface: {
    surfaceId: "checkout-success",
    catalogId: "local://coffee_booking_catalog.json",
  },
};

const UpdateCheckoutSuccessComponents = (
  total: number,
  itemCount: number,
  orderNumber: string,
) => ({
  version: "v0.9",
  updateComponents: {
    surfaceId: "checkout-success",
    components: [
      {
        id: "root",
        component: "CheckoutSuccessCard",
        total,
        itemCount,
        orderNumber,
      },
    ],
  },
});

const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);
const cart = ref<CartItem[]>([]);

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

const handleAction = (payload: ActionPayload) => {
  const { name, context } = payload;

  if (name === "add_to_cart") {
    const product = context?.product as Product;
    if (!product) return;
    const existing = cart.value.find(item => item.product.id === product.id);
    if (existing) {
      cart.value = cart.value.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      );
    } else {
      cart.value = [...cart.value, { product, quantity: 1 }];
    }
  } else if (name === "update_quantity") {
    const { productId, quantity } = context || {};
    if (!productId || !quantity) return;
    cart.value = cart.value.map(item =>
      item.product.id === productId ? { ...item, quantity } : item,
    );
  } else if (name === "remove_from_cart") {
    const { productId } = context || {};
    if (!productId) return;
    cart.value = cart.value.filter(item => item.product.id !== productId);
  } else if (name === "checkout") {
    const { total, itemCount } = context || {};
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    onAgentCommand({ version: "v0.9", deleteSurface: { surfaceId: "shop" } });
    setTimeout(() => {
      onAgentCommand(CreateCheckoutSuccessSurface);
      onAgentCommand(UpdateCheckoutSuccessComponents(total, itemCount, orderNumber));
    }, 100);
    cart.value = [];
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
    { version: "v0.9", deleteSurface: { surfaceId: "shop" } },
    { version: "v0.9", deleteSurface: { surfaceId: "checkout-success" } },
  ];
  card.value = [];
  cart.value = [];
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
      onAgentCommand(CreateShopSurface);
      onAgentCommand(UpdateShopComponents);
      onAgentCommand(InitDataModel);
    }
  },
);

watch(
  () => cart.value,
  value => {
    if (card.value.some(c => c.id === "shop")) {
      onAgentCommand({
        version: "v0.9",
        updateDataModel: {
          surfaceId: "shop",
          path: "/cart",
          value,
        },
      });
    }
  },
  { deep: true },
);

const components = {
  ProductListCard,
  CartCard,
  OrderSummaryCard,
  CheckoutSuccessCard,
  MultiCardContainer,
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
使用 XCard 实现 A2UI v0.9 协议的多卡片协同与状态同步示例。演示了购物车场景中多个 Surface 之间的数据共享、跨卡片通信和实时价格计算，配合 catalog 机制。
</docs>

<docs lang="en-US">
Multi-card coordination and state synchronization example implementing A2UI v0.9 protocol with XCard. Demonstrates data sharing between multiple Surfaces, cross-card communication, and real-time price calculation in a shopping cart scenario with catalog mechanism.
</docs>
