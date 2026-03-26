---
category: Components
group:
  title: 工具
  order: 3
title: XRequest
order: 1
subtitle: 请求
description: 通用流式请求工具，适用于 AI 对话与 SSE 场景。
packageName: x-sdk
---

## 何时使用

- 需要向后端模型服务发起流式请求（SSE / chunked response）。
- 需要统一处理超时、中断、重试与回调更新。

## 代码演示

<!-- prettier-ignore -->
<demo src="./demo/x-request-basic.vue">基础请求</demo>
<demo src="./demo/x-request-manual.vue">手动触发</demo>
<demo src="./demo/x-request-custom-params-headers.vue">自定义参数和请求头</demo>
<demo src="./demo/x-request-custom-transformer.vue">自定义转换器</demo>
<demo src="./demo/x-request-stream-separator.vue">流分隔符配置</demo>
<demo src="./demo/x-request-timeout.vue">请求超时配置</demo>
<demo src="./demo/x-request-stream-timeout.vue">流超时配置</demo>

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

### setXRequestGlobalOptions

```ts
type setXRequestGlobalOptions<Input, Output> = (
  options: XRequestGlobalOptions<Input, Output>,
) => void;
```

### XRequestGlobalOptions

```ts
type XRequestGlobalOptions<Input, Output> = Pick<
  XRequestOptions<Input, Output>,
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

```ts
interface XFetchMiddlewares {
  onRequest?: (
    ...ags: Parameters<typeof fetch>
  ) => Promise<Parameters<typeof fetch>>;
  onResponse?: (response: Response) => Promise<Response>;
}
```

## FAQ

### XRequest 中使用 transformStream 的时候会造成第二次输入请求的时候流被锁定的问题，怎么解决？

```ts
onError TypeError: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader
```

Web Streams API 规定，一个流在同一时间只能被一个 reader 锁定。复用会报错，所以在使用 TransformStream 的时候，需要注意以下几点：

1. 确保 transformStream 函数返回的是一个新的 ReadableStream 对象，而不是同一个对象。
2. 确保 transformStream 函数中没有对 response.body 进行多次读取操作。

**推荐写法**

```vue
<script setup lang="ts">
import { XRequest } from "@antdv-next/x-sdk";

// 推荐写法：transformStream 用函数返回新实例
const request = XRequest(url, {
  manual: true,
  transformStream: () =>
    new TransformStream({
      transform(chunk, controller) {
        // 你的自定义处理逻辑
        controller.enqueue({ data: chunk });
      },
    }),
  // 其他配置...
});
</script>
```

```vue
<script setup lang="ts">
// 不要持久化在 Provider/useState
const request = XRequest(url, {
  manual: true,
  transformStream: new TransformStream({ ... }),
});
</script>
```
