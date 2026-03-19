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

  it("registers ABubble* aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("ABubble")).toBe(app.component("XBubble"));
    expect(app.component("ABubbleList")).toBe(app.component("XBubbleList"));
    expect(app.component("ABubbleSystem")).toBe(app.component("XBubbleSystem"));
    expect(app.component("ABubbleDivider")).toBe(
      app.component("XBubbleDivider"),
    );
  });
});
