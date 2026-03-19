import { mount } from "@vue/test-utils";
import { ConfigProvider } from "antdv-next";
import { describe, expect, it, vi } from "vite-plus/test";
import { ref } from "vue";

import { Bubble } from "../../index";
import XProvider from "../index";

describe("XProvider theme Bubble typing token", () => {
  it("injects Bubble.typingContent from theme.components", async () => {
    vi.useFakeTimers();
    try {
      mount({
        render() {
          return (
            <ConfigProvider theme={{ zeroRuntime: true }}>
              <XProvider
                theme={{
                  zeroRuntime: false,
                  components: {
                    Bubble: {
                      typingContent: '"💖"',
                    },
                  },
                }}
              >
                <Bubble
                  content={"Ant Design X - Better UI toolkit. ".repeat(4)}
                  typing={{ effect: "typing", step: 1, interval: 100 }}
                />
              </XProvider>
            </ConfigProvider>
          );
        },
      });

      await vi.advanceTimersByTimeAsync(0);
      const cssText = document.head.textContent || "";
      expect(cssText).toContain('--ant-bubble-typing-content:"💖"');
    } finally {
      vi.useRealTimers();
    }
  });

  it("updates Bubble.typingContent when theme changes at runtime", async () => {
    vi.useFakeTimers();
    try {
      const useCustom = ref(false);

      mount({
        setup() {
          return () => (
            <XProvider
              theme={{
                zeroRuntime: false,
                components: {
                  Bubble: useCustom.value
                    ? { typingContent: '"💖"' }
                    : { typingContent: '"|"' },
                },
              }}
            >
              <Bubble
                content={"Ant Design X - Better UI toolkit. ".repeat(4)}
                typing={{ effect: "typing", step: 1, interval: 100 }}
              />
            </XProvider>
          );
        },
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(document.head.textContent || "").toContain(
        '--ant-bubble-typing-content:"|"',
      );

      useCustom.value = true;
      await vi.advanceTimersByTimeAsync(0);
      expect(document.head.textContent || "").toContain(
        '--ant-bubble-typing-content:"💖"',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("updates Bubble token under parent zeroRuntime theme", async () => {
    vi.useFakeTimers();
    try {
      const useCustom = ref(false);

      mount({
        setup() {
          return () => (
            <ConfigProvider theme={{ zeroRuntime: true }}>
              <XProvider
                theme={{
                  zeroRuntime: false,
                  components: {
                    Bubble: useCustom.value ? { typingContent: '"💖"' } : {},
                  },
                }}
              >
                <Bubble
                  content={"Ant Design X - Better UI toolkit. ".repeat(4)}
                  typing={{ effect: "typing", step: 1, interval: 100 }}
                />
              </XProvider>
            </ConfigProvider>
          );
        },
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(document.head.textContent || "").toContain(
        '--ant-bubble-typing-content:"|"',
      );

      useCustom.value = true;
      await vi.advanceTimersByTimeAsync(0);
      expect(document.head.textContent || "").toContain(
        '--ant-bubble-typing-content:"💖"',
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
