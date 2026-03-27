import { describe, expect, it } from "vite-plus/test";
import { createApp } from "vue";

import AntdvX, { Suggestion } from "../../";

describe("Suggestion exports", () => {
  it("supports direct named exports", () => {
    expect(Suggestion.name).toBe("XSuggestion");
  });

  it("registers ASuggestion alias in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("ASuggestion")).toBe(app.component("XSuggestion"));
  });
});
