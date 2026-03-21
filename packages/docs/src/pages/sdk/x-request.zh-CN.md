---
group:
  title: 工具
  order: 2
title: XRequest
subtitle: 请求
description: 通用流式请求工具，适用于 AI 对话与 SSE 场景。
order: 3
---

## 何时使用

- 需要向后端模型服务发起流式请求（SSE / chunked response）。
- 需要统一处理超时、中断、重试与回调更新。

## 代码演示

<demo src="./demo/x-request-basic.vue">基础流式请求</demo>
<demo src="./demo/x-request-custom-params-headers.vue">请求参数与请求头</demo>
<demo src="./demo/x-request-custom-transformer.vue">自定义转换器</demo>
<demo src="./demo/x-request-stream-separator.vue">流分隔符配置</demo>
<demo src="./demo/x-request-stream-timeout.vue">Stream 超时</demo>

## 基础示例代码

```ts
import { XRequest } from "@antdv-next/x-sdk";

const request = XRequest("/api/chat", {
  params: { message: "Hello" },
  callbacks: {
    onUpdate: chunk => {
      console.log("chunk", chunk);
    },
    onSuccess: chunks => {
      console.log("done", chunks);
    },
    onError: error => {
      console.error(error);
    },
  },
});
```

## 手动触发

```ts
import { XRequest } from "@antdv-next/x-sdk";

const request = XRequest("/api/chat", {
  manual: true,
  callbacks: {
    onUpdate: chunk => console.log(chunk),
    onSuccess: chunks => console.log(chunks),
    onError: error => console.error(error),
  },
});

request.run({ message: "请继续" });
```

## API

### XRequestFunction

```ts
type XRequestFunction<
  Input = Record<PropertyKey, any>,
  Output = Record<string, string>,
> = (
  baseURL: string,
  options: XRequestOptions<Input, Output>,
) => XRequestClass<Input, Output>;
```

### XRequestOptions

| 属性              | 说明                                         | 类型                                                                                                                                      | 默认值  |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `callbacks`       | 请求回调处理集                               | `XRequestCallbacks<Output>`                                                                                                               | -       |
| `params`          | 请求参数                                     | `Input`                                                                                                                                   | -       |
| `headers`         | 额外请求头                                   | `Record<string, string>`                                                                                                                  | -       |
| `timeout`         | 请求超时（发起到连通），单位 ms              | `number`                                                                                                                                  | -       |
| `streamTimeout`   | chunk 间隔超时，单位 ms                      | `number`                                                                                                                                  | -       |
| `fetch`           | 自定义 `fetch`                               | `typeof fetch`                                                                                                                            | -       |
| `middlewares`     | 请求前后中间件                               | `XFetchMiddlewares`                                                                                                                       | -       |
| `transformStream` | 自定义流转换器                               | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -       |
| `streamSeparator` | 流分隔符（`transformStream` 有值时不生效）   | `string`                                                                                                                                  | `\n\n`  |
| `partSeparator`   | 分段分隔符（`transformStream` 有值时不生效） | `string`                                                                                                                                  | `\n`    |
| `kvSeparator`     | 键值分隔符（`transformStream` 有值时不生效） | `string`                                                                                                                                  | `:`     |
| `manual`          | 是否手动触发请求                             | `boolean`                                                                                                                                 | `false` |
| `retryInterval`   | 失败后自动重试间隔，单位 ms                  | `number`                                                                                                                                  | -       |
| `retryTimes`      | 最大重试次数                                 | `number`                                                                                                                                  | -       |

### XRequestCallbacks

| 属性        | 说明                         | 类型                                                                                                 | 默认值 |
| ----------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| `onSuccess` | 请求成功回调                 | `(chunks: Output[], responseHeaders: Headers, message?: ChatMessage) => void`                        | -      |
| `onError`   | 请求失败回调，可返回重试间隔 | `(error: Error, errorInfo: any, responseHeaders?: Headers, message?: ChatMessage) => number \| void` | -      |
| `onUpdate`  | 流式更新回调                 | `(chunk: Output, responseHeaders: Headers, message?: ChatMessage) => void`                           | -      |

### XRequestClass

| 属性           | 说明                             | 类型                       |
| -------------- | -------------------------------- | -------------------------- |
| `abort`        | 取消请求                         | `() => void`               |
| `run`          | 手动执行（`manual=true` 时有效） | `(params?: Input) => void` |
| `isRequesting` | 当前是否请求中                   | `boolean`                  |
