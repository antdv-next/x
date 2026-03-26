---
group:
  title: Utilities
  order: 3
title: XRequest
subtitle: Request
description: Universal streaming request utility for AI chat and SSE scenarios.
order: 1
tag: 2.0.0

packageName: x-sdk
---

## When To Use

- You need to send streaming requests to model services (SSE / chunked response).
- You need unified timeout, abort, retry, and incremental update callbacks.

## Code Demo

<demo src="./demo/x-request-basic.vue">Basic Usage</demo>
<demo src="./demo/x-request-custom-params.vue">Custom Parameters</demo>
<demo src="./demo/x-request-custom-transformer.vue">Custom Transformer</demo>
<demo src="./demo/x-request-stream-separator.vue">Stream Parsing Configuration</demo>
<demo src="./demo/x-request-manual.vue">Manual Trigger</demo>
<demo src="./demo/x-request-timeout.vue">Timeout Configuration</demo>
<demo src="./demo/x-request-stream-timeout.vue">Chunk Timeout Configuration</demo>

## API

### XRequestFunction

```ts | pure
type XRequestFunction<
  Input = Record<PropertyKey, any>,
  Output = Record<string, string>,
> = (
  baseURL: string,
  options: XRequestOptions<Input, Output>,
) => XRequestClass<Input, Output>;
```

### XRequestOptions

| Property          | Description                                                 | Type                                                                                                                                      | Default | Version |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| `callbacks`       | Request callback handlers                                   | `XRequestCallbacks<Output>`                                                                                                               | -       | -       |
| `params`          | Request parameters                                          | `Input`                                                                                                                                   | -       | -       |
| `headers`         | Extra request headers                                       | `Record<string, string>`                                                                                                                  | -       | -       |
| `timeout`         | Request timeout from send to connect, in ms                 | `number`                                                                                                                                  | -       | -       |
| `streamTimeout`   | Chunk interval timeout in stream mode, in ms                | `number`                                                                                                                                  | -       | -       |
| `fetch`           | Custom `fetch`                                              | `typeof fetch`                                                                                                                            | -       | -       |
| `middlewares`     | Request/response middlewares                                | `XFetchMiddlewares`                                                                                                                       | -       | -       |
| `transformStream` | Custom stream transformer                                   | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -       | -       |
| `streamSeparator` | Stream separator (ignored when `transformStream` is set)    | `string`                                                                                                                                  | `\n\n`  | 2.2.0   |
| `partSeparator`   | Part separator (ignored when `transformStream` is set)      | `string`                                                                                                                                  | `\n`    | 2.2.0   |
| `kvSeparator`     | Key-value separator (ignored when `transformStream` is set) | `string`                                                                                                                                  | `:`     | 2.2.0   |
| `manual`          | Whether request is manually triggered                       | `boolean`                                                                                                                                 | `false` | -       |
| `retryInterval`   | Retry interval when request fails, in ms                    | `number`                                                                                                                                  | -       | -       |
| `retryTimes`      | Maximum retry attempts                                      | `number`                                                                                                                                  | -       | -       |

### XRequestCallbacks

| Property    | Description                                                                                                                                                                         | Type                                                                                                 | Default |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| `onSuccess` | Success callback. When used with Chat Provider, additionally gets the assembled message                                                                                             | `(chunks: Output[], responseHeaders: Headers, message?: ChatMessage) => void`                        | -       |
| `onError`   | Error callback. Can return a number indicating retry interval (ms). When both `onError` return value and `options.retryInterval` exist, the `onError` return value takes precedence | `(error: Error, errorInfo: any, responseHeaders?: Headers, message?: ChatMessage) => number \| void` | -       |
| `onUpdate`  | Incremental update callback. When used with Chat Provider, additionally gets the assembled message                                                                                  | `(chunk: Output, responseHeaders: Headers, message?: ChatMessage) => void`                           | -       |

### XRequestClass

| Property       | Description                      | Type                       | Default |
| -------------- | -------------------------------- | -------------------------- | ------- |
| `abort`        | Abort request                    | `() => void`               | -       |
| `run`          | Execute manually (`manual=true`) | `(params?: Input) => void` | -       |
| `isRequesting` | Current requesting state         | `boolean`                  | -       |

### setXRequestGlobalOptions

```ts | pure
type setXRequestGlobalOptions<Input, Output> = (
  options: XRequestGlobalOptions<Input, Output>,
) => void;
```

### XRequestGlobalOptions

```ts | pure
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

```ts | pure
interface XFetchMiddlewares {
  onRequest?: (
    ...args: Parameters<typeof fetch>
  ) => Promise<Parameters<typeof fetch>>;
  onResponse?: (response: Response) => Promise<Response>;
}
```

## FAQ

### When using transformStream in XRequest, it causes stream locking issues on the second request. How to solve this?

```ts | pure
onError TypeError: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader
```

The Web Streams API stipulates that a stream can only be locked by one reader at the same time. Reuse will cause an error. Therefore, when using TransformStream, you need to pay attention to the following points:

1. Ensure that the `transformStream` function returns a new `ReadableStream` object, not the same object.
2. Ensure that the `transformStream` function does not perform multiple read operations on `response.body`.

**Recommended**

```ts | pure
import { XRequest } from "@antdv-next/x-sdk";

const request = XRequest(url, {
  manual: true,
  // Recommended: transformStream returns a new instance with a function
  transformStream: () =>
    new TransformStream({
      transform(chunk, controller) {
        // Your custom processing logic
        controller.enqueue({ data: chunk });
      },
    }),
});
```
