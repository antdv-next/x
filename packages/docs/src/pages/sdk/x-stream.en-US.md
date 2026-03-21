---
group:
  title: Utilities
  order: 2
title: XStream
subtitle: Stream
description: Transform readable streams into async iterable outputs.
order: 4
---

## When To Use

- You need to parse SSE `ReadableStream` into structured objects.
- You need to decode custom streaming protocols and consume them with `for await...of`.

## Examples

<demo src="./demo/x-stream-default-protocol.vue">Default Protocol - SSE</demo>
<demo src="./demo/x-stream-custom-protocol.vue">Custom Protocol</demo>

## Basic Example Code

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

## Custom Protocol Parsing

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

| Property          | Description                                                 | Type                         | Default                  |
| ----------------- | ----------------------------------------------------------- | ---------------------------- | ------------------------ |
| `readableStream`  | Readable stream instance                                    | `ReadableStream<Uint8Array>` | -                        |
| `transformStream` | Custom transform stream processor                           | `TransformStream<string, T>` | Built-in SSE transformer |
| `streamSeparator` | Stream separator (ignored when `transformStream` is set)    | `string`                     | `\n\n`                   |
| `partSeparator`   | Part separator (ignored when `transformStream` is set)      | `string`                     | `\n`                     |
| `kvSeparator`     | Key-value separator (ignored when `transformStream` is set) | `string`                     | `:`                      |

## Notes

- Default output follows SSE fields (`event`, `data`, `id`, `retry`).
