/**
 * 为 X 文档站生成 Playground 链接。
 *
 * 协议与 antdv-next-playground 的 store.ts 对齐:
 * - hash 负载只含 `src/App.vue` + `_o` 选项(xEnabled: true)
 * - Playground 端根据 `?x=1` 和 `_o.xEnabled` 自动注册 X 组件 & import map
 * - 编码使用 `utoa`(encodeURIComponent + btoa),与 Playground 反序列化一致
 */

function utoa(data: string): string {
  return btoa(unescape(encodeURIComponent(data)));
}
export function loadPlaygroundUrl(code: string) {
  const baseUrl = "https://play.antdv-next.com/";

  const defaultCode = `<script setup lang="ts">
import { version as vueVersion } from "vue";

const message = "Hello Antdv Next X";
</script>

<template>
  <a-welcome :title="message" :description="\`Vue \${vueVersion}\`" />
</template>
`;

  const state: Record<string, any> = {
    "src/App.vue": code || defaultCode,
    _o: { xEnabled: true },
  };

  const hash = utoa(JSON.stringify(state));
  return `${baseUrl}?x=1#${hash}`;
}
