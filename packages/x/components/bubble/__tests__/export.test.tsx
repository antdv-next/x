import { describe, expect, it } from "vite-plus/test";
import { createApp } from "vue";

import AntdvX, {
  Bubble,
  BubbleDivider,
  BubbleList,
  BubbleSystem,
} from "../../";

describe("Bubble exports", () => {
  it("supports direct named exports", () => {
    expect(Bubble.List).toBe(BubbleList);
    expect(Bubble.System).toBe(BubbleSystem);
    expect(Bubble.Divider).toBe(BubbleDivider);
  });

  it("registers Bubble aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("AxBubble")).toBeDefined();
    expect(app.component("AxBubbleList")).toBeDefined();
    expect(app.component("AxBubbleSystem")).toBeDefined();
    expect(app.component("AxBubbleDivider")).toBeDefined();
  });
});
