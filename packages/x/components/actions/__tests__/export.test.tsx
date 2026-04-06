import { describe, expect, it } from "vite-plus/test";
import { createApp } from "vue";

import AntdvX, {
  Actions,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
} from "../../";

describe("Actions exports", () => {
  it("supports direct named exports", () => {
    expect(Actions.Audio).toBe(ActionsAudio);
    expect(Actions.Copy).toBe(ActionsCopy);
    expect(Actions.Feedback).toBe(ActionsFeedback);
    expect(Actions.Item).toBe(ActionsItem);
  });

  it("registers Actions aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("AxActions")).toBeDefined();
    expect(app.component("AxActionsAudio")).toBeDefined();
    expect(app.component("AxActionsCopy")).toBeDefined();
    expect(app.component("AxActionsFeedback")).toBeDefined();
    expect(app.component("AxActionsItem")).toBeDefined();
  });
});
