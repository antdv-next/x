# XRequest API

## XRequestFunction

```ts
type XRequestFunction<Input = AnyObject, Output = SSEOutput> = (
  baseURL: MaybeRef<string>,
  options?: XRequestConfigOptions<Input, Output>,
) => AbstractXRequestClass<Input, Output>;
```

`baseURL` 可以是字符串或 ref。`options` 可选；除非 `manual: true`，否则请求会立即发出。

## XRequestConfigOptions

| 属性            | 说明                                                                             | 类型                                                                                                                                      | 默认值             |
| --------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| callbacks       | 请求回调                                                                         | `XRequestCallbacks<Output>`                                                                                                               | -                  |
| params          | 请求参数，会合并进 JSON body                                                     | `MaybeRef<Partial<Input>>`                                                                                                                | -                  |
| headers         | 额外请求头，会覆盖全局 header                                                    | `MaybeRef<Record<string, string>>`                                                                                                        | -                  |
| timeout         | 从发送请求到连接上服务的超时时间，单位 ms                                        | `MaybeRef<number>`                                                                                                                        | -                  |
| streamTimeout   | stream 模式下每次 chunk 返回的最大间隔，单位 ms                                  | `MaybeRef<number>`                                                                                                                        | -                  |
| fetch           | 自定义 fetch                                                                     | `(baseURL: Parameters<typeof fetch>[0], options: XRequestOptions<Input, Output>) => Promise<Response>`                                    | `globalThis.fetch` |
| middlewares     | 请求前/请求后中间件                                                              | `XFetchMiddlewares<Input, Output>`                                                                                                        | -                  |
| transformStream | 自定义 stream 处理器，也支持传入 `(baseURL, responseHeaders)` 工厂函数           | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -                  |
| streamSeparator | 分隔不同事件；设置 `transformStream` 时不生效                                    | `MaybeRef<string>`                                                                                                                        | `"\n\n"`           |
| partSeparator   | 分隔事件内的不同部分；设置 `transformStream` 时不生效                            | `MaybeRef<string>`                                                                                                                        | `"\n"`             |
| kvSeparator     | 分隔键和值；设置 `transformStream` 时不生效                                      | `MaybeRef<string>`                                                                                                                        | `":"`              |
| manual          | 为 `true` 时不会立即发送，需手动调用 `run()`。传给 Chat Provider 时必须为 `true` | `MaybeRef<boolean>`                                                                                                                       | `false`            |
| retryInterval   | 重试间隔，单位 ms；不设置则不会自动重试                                          | `MaybeRef<number>`                                                                                                                        | -                  |
| retryTimes      | 最大重试次数                                                                     | `MaybeRef<number>`                                                                                                                        | -                  |

> 其他 `RequestInit` 字段会透传，但实现始终把 `method` 设为 `POST`，不存在 `GET` 模式。

## XRequestCallbacks

| 属性      | 说明                                                                                                                 | 类型                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| onSuccess | 成功回调。与 Chat Provider 一起使用时会额外拿到组装好的 message                                                      | `(chunks: Output[], responseHeaders: Headers, message?: MessageInfo<ChatMessage>) => void`                   |
| onError   | 错误回调。与 Chat Provider 一起使用时会额外拿到 fallback message。返回数字时会作为重试间隔（优先于 `retryInterval`） | `(error: Error, errorInfo?: any, responseHeaders?: Headers, fallbackMsg?: MessageInfo<ChatMessage>) => void` |
| onUpdate  | 增量更新回调。与 Chat Provider 一起使用时会额外拿到组装好的 message                                                  | `(chunk: Output, responseHeaders: Headers, message?: MessageInfo<ChatMessage>) => void`                      |

## AbstractXRequestClass / XRequestClass

| 成员            | 说明                                   | 类型                                                                                |
| --------------- | -------------------------------------- | ----------------------------------------------------------------------------------- |
| baseURL         | 基础 URL（可以是 ref）                 | `MaybeRef<string>`                                                                  |
| options         | 请求配置                               | `XRequestConfigOptions<Input, Output>`                                              |
| run             | 手动执行请求（仅 `manual` 为 true 时） | `(params?: Input) => boolean`                                                       |
| abort           | 取消请求                               | `() => void`                                                                        |
| manual          | 是否为手动模式                         | `boolean`                                                                           |
| isTimeout       | 连接超时是否触发                       | `boolean`                                                                           |
| isStreamTimeout | stream chunk 超时是否触发              | `boolean`                                                                           |
| isRequesting    | 是否在请求中                           | `boolean`                                                                           |
| state           | 只读响应式状态                         | `Readonly<{ isTimeout: boolean; isStreamTimeout: boolean; isRequesting: boolean }>` |
| asyncHandler    | 当前请求的 Promise                     | `Promise<any>`                                                                      |

## setXRequestGlobalOptions

```ts
type setXRequestGlobalOptions<Input, Output> = (
  options: XRequestGlobalOptions<Input, Output>,
) => void;
```

`XRequestGlobalOptions` 是 `headers`、`timeout`、`streamTimeout`、`middlewares`、`fetch`、`transformStream`、`manual` 的 `Pick`。

## XFetchMiddlewares

```ts
interface XFetchMiddlewares<Input, Output> {
  onRequest?: (
    baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<Input, Output>,
  ) => Promise<[Parameters<typeof fetch>[0], XRequestOptions<Input, Output>]>;
  onResponse?: (response: Response) => Promise<Response>;
}
```

## 响应处理

- `text/event-stream`：依次按 `streamSeparator`（默认 `\n\n`）、`partSeparator`（默认 `\n`）、`kvSeparator`（默认 `:`）拆分。同一事件内重复的 `data` 字段会用 `\n` 合并；自定义多字符 `kvSeparator` 会被完整消费。
- `application/json`：作为单个 chunk 解析。若 payload 中 `success: false`，会用 `message` / `name` 创建 `Error`，调用 `onError`（payload 作为 `errorInfo`）并结束请求；否则调用 `onUpdate` 和 `onSuccess([chunk])`。
- 其他 content-type 会抛出 `The response content-type: ... is not support!`。

## FAQ

### transformStream 在第二次请求时导致 stream locking

Web Streams API 规定一个 stream 同一时间只能被一个 reader 锁定。请通过工厂函数每次返回新的 stream，不要复用同一个实例：

```ts
const provider = ref(
  new CustomProvider({
    request: XRequest(url, {
      manual: true,
      // ✅ 每次请求返回新的 TransformStream
      transformStream: () =>
        new TransformStream({
          transform(chunk, controller) {
            controller.enqueue({ data: chunk });
          },
        }),
    }),
  }),
);
```

```ts
// ❌ 跨请求复用同一个 TransformStream 实例
const request = XRequest(url, {
  manual: true,
  transformStream: new TransformStream({ ... }),
});
```
