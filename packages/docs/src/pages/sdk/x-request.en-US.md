---
group:
  title: Utilities
  order: 2
title: XRequest
subtitle: Request
description: Universal streaming request utility for AI chat and SSE scenarios.
order: 3
---

## When To Use

- You need to send streaming requests to model services (SSE / chunked response).
- You need unified timeout, abort, retry, and incremental update callbacks.

## Basic Example Code

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

## Manual Trigger

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

request.run({ message: "Continue please" });
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
