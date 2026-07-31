<script setup lang="ts">
import { setupCodeHighlighter } from "@antdv-next/x";
import { computed, ref } from "vue";

// 默认仅内置 6 种常用语言（ts/js/python/json/html/css）。
// Go / Rust / Java 不在内置白名单中，需通过 setupCodeHighlighter 注入加载器，
// 切换时才会按需动态加载对应语法。
setupCodeHighlighter({
  loadLanguage: async lang => {
    const loaders: Record<string, () => Promise<{ default: any }>> = {
      go: () => import("shiki/dist/langs/go.mjs"),
      rust: () => import("shiki/dist/langs/rust.mjs"),
      java: () => import("shiki/dist/langs/java.mjs"),
    };
    const loader = loaders[lang];
    return loader ? (await loader()).default : null;
  },
});

const snippets = {
  go: {
    label: "Go",
    code: `package main

import "fmt"

func main() {
    names := []string{"Alice", "Bob"}
    for i, name := range names {
        fmt.Println(i, "Hello,", name)
    }
}`,
  },
  rust: {
    label: "Rust",
    code: `fn main() {
    let names = vec!["Alice", "Bob"];
    for (i, name) in names.iter().enumerate() {
        println!("{}: Hello, {}!", i, name);
    }
}`,
  },
  java: {
    label: "Java",
    code: `public class Main {
    public static void main(String[] args) {
        String[] names = {"Alice", "Bob"};
        for (int i = 0; i < names.length; i++) {
            System.out.println(i + ": Hello, " + names[i] + "!");
        }
    }
}`,
  },
} as const;

const options = [
  ...Object.entries(snippets).map(([value, { label }]) => ({ value, label })),
  { value: "text", label: "Plain Text" },
];

const language = ref<string>("go");

const current = computed(() => {
  if (language.value === "text") {
    return {
      code: "This language has no registered loader, so it falls back to plain text without syntax highlighting.",
      language: "text",
    };
  }
  const key = language.value as keyof typeof snippets;
  return { code: snippets[key].code, language: key };
});
</script>

<template>
  <a-flex vertical :gap="16">
    <a-segmented v-model:value="language" :options="options" />
    <ax-code-highlighter :content="current.code" :language="current.language" />
  </a-flex>
</template>

<docs lang="zh-CN">
默认仅内置 6 种常用语言。本 demo 通过 `setupCodeHighlighter` 注入 Go / Rust / Java 的加载器，切换时按需动态加载对应语法；未注册语言（如 Plain Text）则降级为纯文本。
</docs>

<docs lang="en-US">
Only six common languages are built in. This demo injects Go / Rust / Java loaders via `setupCodeHighlighter`, loading each grammar on demand when switched to. Unregistered languages (e.g. Plain Text) fall back to plain text.
</docs>
