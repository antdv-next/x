import { describe, expect, it } from "vite-plus/test";
import { createApp } from "vue";

import AntdvX, { FileCard, FileCardList } from "../../";

describe("FileCard exports", () => {
  it("supports direct named exports", () => {
    expect(FileCard.List).toBe(FileCardList);
  });

  it("registers FileCard aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("AxFileCard")).toBeDefined();
    expect(app.component("AxFileCardList")).toBeDefined();
  });
});
