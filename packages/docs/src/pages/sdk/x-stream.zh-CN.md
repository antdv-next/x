---
group:
  title: 工具
  order: 2
title: XStream
subtitle: 流
description: 将可读数据流转换为可迭代输出。
order: 4
---

## 何时使用

- 需要把 SSE 协议 `ReadableStream` 解析成结构化对象。
- 需要对任意协议流进行解码，并通过 `for await...of` 消费。

## 基础示例代码

```ts
import { XStream } from "@antdv-next/x-sdk";

async function request() {
  const response = await fetch("/api/stream");

  for await (const chunk of XStream({
    readableStream: response.body!,
  })) {
    console.log(chunk);
  }
}
```

## 自定义协议解析

```ts
import { XStream } from "@antdv-next/x-sdk";

const stream = XStream({
  readableStream: response.body!,
  transformStream: new TransformStream<string, { data: string }>({
    transform(chunk, controller) {
      controller.enqueue({ data: chunk });
    },
  }),
});
```

## API

### XStreamOptions

| 属性              | 说明                                         | 类型                         | 默认值          |
| ----------------- | -------------------------------------------- | ---------------------------- | --------------- |
| `readableStream`  | `ReadableStream` 实例                        | `ReadableStream<Uint8Array>` | -               |
| `transformStream` | 自定义转换流处理器                           | `TransformStream<string, T>` | 默认 SSE 转换器 |
| `streamSeparator` | 流分隔符（`transformStream` 有值时不生效）   | `string`                     | `\n\n`          |
| `partSeparator`   | 分段分隔符（`transformStream` 有值时不生效） | `string`                     | `\n`            |
| `kvSeparator`     | 键值分隔符（`transformStream` 有值时不生效） | `string`                     | `:`             |

## 说明

- 默认输出符合 SSE 字段规范（如 `event`、`data`、`id`、`retry`）。
