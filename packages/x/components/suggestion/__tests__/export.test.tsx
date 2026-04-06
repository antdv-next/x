import { describe, expect, it } from "vite-plus/test";
import { createApp } from "vue";

import AntdvX, { Suggestion } from "../../";

describe("Suggestion exports", () => {
  it("supports direct named exports", () => {
    expect(Suggestion.name).toBe("AxSuggestion");
  });

  it("registers Suggestion aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("AxSuggestion")).toBeDefined();
  });
});
