import { describe, expect, it } from "vitest";
import { effectScope, nextTick, ref } from "vue";

import useXConversations from "../index";

describe("useXConversations", () => {
  it("syncs default conversations and active key from refs", async () => {
    const defaultConversations = ref([
      { key: "session_1", label: "Session 1" },
      { key: "session_2", label: "Session 2" },
    ]);
    const defaultActiveConversationKey = ref("session_1");

    const scope = effectScope();
    const conversationsHandler = scope.run(() =>
      useXConversations({
        defaultConversations,
        defaultActiveConversationKey,
      }),
    );

    expect(conversationsHandler).toBeTruthy();
    if (!conversationsHandler) return;

    expect(
      conversationsHandler.conversations.value.map(item => item.key),
    ).toEqual(["session_1", "session_2"]);
    expect(conversationsHandler.activeConversationKey.value).toBe("session_1");

    defaultConversations.value = [{ key: "session_3", label: "Session 3" }];
    defaultActiveConversationKey.value = "session_3";

    await nextTick();

    expect(
      conversationsHandler.conversations.value.map(item => item.key),
    ).toEqual(["session_3"]);
    expect(conversationsHandler.activeConversationKey.value).toBe("session_3");

    scope.stop();
  });
});
