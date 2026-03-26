---
category: Components
group:
  title: Utilities
  order: 3
title: XRequest
order: 1
subtitle: Request
description: Universal streaming request utility for AI chat and SSE scenarios.
packageName: x-sdk
---

## When To Use

- You need to send streaming requests to model services (SSE / chunked response).
- You need unified timeout, abort, retry, and incremental update callbacks.

## Code Demo

<!-- prettier-ignore -->
<demo src="./demo/x-request-basic.vue">Basic Request</demo>
<demo src="./demo/x-request-manual.vue">Manual Trigger</demo>
<demo src="./demo/x-request-custom-params-headers.vue">Custom Parameters and Headers</demo>
<demo src="./demo/x-request-custom-transformer.vue">Custom Transformer</demo>
<demo src="./demo/x-request-stream-separator.vue">Stream Separator Configuration</demo>
<demo src="./demo/x-request-timeout.vue">Request Timeout Configuration</demo>
<demo src="./demo/x-request-stream-timeout.vue">Stream Timeout Configuration</demo>

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

| Property          | Description                                                 | Type                                                                                                                                      | Default |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `callbacks`       | Request callback handlers                                   | `XRequestCallbacks<Output>`                                                                                                               | -       |
| `params`          | Request parameters                                          | `Input`                                                                                                                                   | -       |
| `headers`         | Extra request headers                                       | `Record<string, string>`                                                                                                                  | -       |
| `timeout`         | Request timeout from send to connect, in ms                 | `number`                                                                                                                                  | -       |
| `streamTimeout`   | Chunk interval timeout in stream mode, in ms                | `number`                                                                                                                                  | -       |
| `fetch`           | Custom `fetch`                                              | `typeof fetch`                                                                                                                            | -       |
| `middlewares`     | Request/response middlewares                                | `XFetchMiddlewares`                                                                                                                       | -       |
| `transformStream` | Custom stream transformer                                   | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -       |
| `streamSeparator` | Stream separator (ignored when `transformStream` is set)    | `string`                                                                                                                                  | `\n\n`  |
| `partSeparator`   | Part separator (ignored when `transformStream` is set)      | `string`                                                                                                                                  | `\n`    |
| `kvSeparator`     | Key-value separator (ignored when `transformStream` is set) | `string`                                                                                                                                  | `:`     |
| `manual`          | Whether request is manually triggered                       | `boolean`                                                                                                                                 | `false` |
| `retryInterval`   | Retry interval when request fails, in ms                    | `number`                                                                                                                                  | -       |
| `retryTimes`      | Maximum retry attempts                                      | `number`                                                                                                                                  | -       |

### XRequestCallbacks

| Property    | Description                               | Type                                                                                                 | Default |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| `onSuccess` | Success callback                          | `(chunks: Output[], responseHeaders: Headers, message?: ChatMessage) => void`                        | -       |
| `onError`   | Error callback, can return retry interval | `(error: Error, errorInfo: any, responseHeaders?: Headers, message?: ChatMessage) => number \| void` | -       |
| `onUpdate`  | Incremental update callback               | `(chunk: Output, responseHeaders: Headers, message?: ChatMessage) => void`                           | -       |

### XRequestClass

| Property       | Description                      | Type                       |
| -------------- | -------------------------------- | -------------------------- |
| `abort`        | Abort request                    | `() => void`               |
| `run`          | Execute manually (`manual=true`) | `(params?: Input) => void` |
| `isRequesting` | Current requesting state         | `boolean`                  |

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

### When using transformStream in XRequest, it causes stream locking issues on the second input request. How to solve this?

```ts
onError TypeError: Failed to execute 'getReader' on 'ReadableStream': ReadableStreamDefaultReader constructor can only accept readable streams that are not yet locked to a reader
```

The Web Streams API stipulates that a stream can only be locked by one reader at the same time. Reuse will cause an error. Therefore, when using TransformStream, you need to pay attention to the following points:

1. Ensure that the transformStream function returns a new ReadableStream object, not the same object.
2. Ensure that the transformStream function does not perform multiple read operations on response.body.

**Recommended Writing**

```vue
<script setup lang="ts">
import { XRequest } from "@antdv-next/x-sdk";

// Recommended: transformStream returns a new instance with a function
const request = XRequest(url, {
  manual: true,
  transformStream: () =>
    new TransformStream({
      transform(chunk, controller) {
        // Your custom processing logic
        controller.enqueue({ data: chunk });
      },
    }),
  // Other configurations...
});
</script>
```

```vue
<script setup lang="ts">
// Do not persist in Provider/useState
const request = XRequest(url, {
  manual: true,
  transformStream: new TransformStream({ ... }),
});
</script>
```
