---
group:
  title: 工具
  order: 3
title: XRequest
subtitle: 请求
description: 通用流式请求工具，适用于 AI 对话与 SSE 场景。
order: 1
tag: 2.0.0

packageName: x-sdk
---

## 何时使用

- 需要向后端模型服务发起流式请求（SSE / chunked response）。
- 需要统一处理超时、中断、重试与回调更新。

## 代码演示

<demo src="./demo/x-request-basic.vue">基础用法</demo>
<demo src="./demo/x-request-custom-params.vue">自定义参数</demo>
<demo src="./demo/x-request-custom-transformer.vue">自定义转换器</demo>
<demo src="./demo/x-request-stream-separator.vue">流解析配置</demo>
<demo src="./demo/x-request-manual.vue">手动触发</demo>
<demo src="./demo/x-request-timeout.vue">超时配置</demo>
<demo src="./demo/x-request-stream-timeout.vue">Chunk 超时配置</demo>

## API

### XRequestFunction

```ts | pure
type XRequestFunction<
  Input = Record<PropertyKey, any>,
  Output = Record<string, string>,
> = (
  baseURL: string,
  options: XRequestConfigOptions<Input, Output>,
) => XRequestClass<Input, Output>;
```

### XRequestConfigOptions

| 属性              | 说明                                         | 类型                                                                                                                                      | 默认值  | 版本  |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----- |
| `callbacks`       | 请求回调处理集                               | `XRequestCallbacks<Output>`                                                                                                               | -       | -     |
| `params`          | 请求参数                                     | `MaybeRef<Input>`                                                                                                                         | -       | -     |
| `headers`         | 额外请求头                                   | `MaybeRef<Record<string, string>>`                                                                                                        | -       | -     |
| `timeout`         | 请求超时（发起到连通），单位 ms              | `MaybeRef<number>`                                                                                                                        | -       | -     |
| `streamTimeout`   | chunk 间隔超时，单位 ms                      | `MaybeRef<number>`                                                                                                                        | -       | -     |
| `fetch`           | 自定义 `fetch`                               | `typeof fetch`                                                                                                                            | -       | -     |
| `middlewares`     | 请求前后中间件                               | `XFetchMiddlewares`                                                                                                                       | -       | -     |
| `transformStream` | 自定义流转换器                               | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -       | -     |
| `streamSeparator` | 流分隔符（`transformStream` 有值时不生效）   | `MaybeRef<string>`                                                                                                                        | `\n\n`  | 2.2.0 |
| `partSeparator`   | 分段分隔符（`transformStream` 有值时不生效） | `MaybeRef<string>`                                                                                                                        | `\n`    | 2.2.0 |
| `kvSeparator`     | 键值分隔符（`transformStream` 有值时不生效） | `MaybeRef<string>`                                                                                                                        | `:`     | 2.2.0 |
| `manual`          | 是否手动触发请求                             | `MaybeRef<boolean>`                                                                                                                       | `false` | -     |
| `retryInterval`   | 失败后自动重试间隔，单位 ms                  | `MaybeRef<number>`                                                                                                                        | -       | -     |
| `retryTimes`      | 最大重试次数                                 | `MaybeRef<number>`                                                                                                                        | -       | -     |

### XRequestCallbacks

| 属性        | 说明                                                                                                                       | 类型                                                                                                 | 默认值 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| `onSuccess` | 请求成功回调。配合 Chat Provider 使用时，额外获取组装后的消息                                                              | `(chunks: Output[], responseHeaders: Headers, message?: ChatMessage) => void`                        | -      |
| `onError`   | 请求失败回调。可返回数字表示重试间隔（ms）。当 `onError` 返回值和 `options.retryInterval` 同时存在时，`onError` 返回值优先 | `(error: Error, errorInfo: any, responseHeaders?: Headers, message?: ChatMessage) => number \| void` | -      |
| `onUpdate`  | 流式更新回调。配合 Chat Provider 使用时，额外获取组装后的消息                                                              | `(chunk: Output, responseHeaders: Headers, message?: ChatMessage) => void`                           | -      |

### XRequestClass

| 属性           | 说明                             | 类型                       | 默认值 |
| -------------- | -------------------------------- | -------------------------- | ------ |
| `abort`        | 取消请求                         | `() => void`               | -      |
| `run`          | 手动执行（`manual=true` 时有效） | `(params?: Input) => void` | -      |
| `isRequesting` | 当前是否请求中                   | `boolean`                  | -      |

### setXRequestGlobalOptions

```ts | pure
type setXRequestGlobalOptions<Input, Output> = (
  options: XRequestGlobalOptions<Input, Output>,
) => void;
```

### XRequestGlobalOptions

```ts | pure
type XRequestGlobalOptions<Input, Output> = Pick<
  XRequestConfigOptions<Input, Output>,
  | "headers"
  | "timeout"
  | "streamTimeout"
  | "middlewares"
  | "fetch"
  | "transformStream"
  | "manual"
>;
```

### XFetchMiddlewares

```ts | pure
interface XFetchMiddlewares {
  onRequest?: (
    ...args: Parameters<typeof fetch>
  ) => Promise<Parameters<typeof fetch>>;
  onResponse?: (response: Response) => Promise<Response>;
}
```

## FAQ

### 使用 XRequest 的 transformStream 时，第二次请求出现流锁定问题，如何解决？

```ts | pure
onError TypeError: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader
```

Web Streams API 规定一个流同一时间只能被一个 reader 锁定，复用会导致报错。因此使用 TransformStream 时需注意：

1. 确保 `transformStream` 函数每次返回一个新的 `ReadableStream` 对象，而非同一个对象。
2. 确保 `transformStream` 函数不会对 `response.body` 进行多次读取。

**推荐写法**

```ts | pure
import { XRequest } from "@antdv-next/x-sdk";

const request = XRequest(url, {
  manual: true,
  // 推荐：transformStream 通过函数返回新实例
  transformStream: () =>
    new TransformStream({
      transform(chunk, controller) {
        // 你的自定义处理逻辑
        controller.enqueue({ data: chunk });
      },
    }),
});
```
