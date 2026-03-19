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

  it("registers AActions* aliases in plugin install", () => {
    const app = createApp({ render: () => null });
    app.use(AntdvX);

    expect(app.component("AActions")).toBe(app.component("XActions"));
    expect(app.component("AActionsAudio")).toBe(app.component("XActionsAudio"));
    expect(app.component("AActionsCopy")).toBe(app.component("XActionsCopy"));
    expect(app.component("AActionsFeedback")).toBe(
      app.component("XActionsFeedback"),
    );
    expect(app.component("AActionsItem")).toBe(app.component("XActionsItem"));
  });
});
