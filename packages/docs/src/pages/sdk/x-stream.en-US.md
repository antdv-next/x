---
group:
  title: Utilities
  order: 3
title: XStream
subtitle: Stream
description: Transform readable data streams.
order: 2
tag: 2.0.0

packageName: x-sdk
---

## When To Use

- Transform SSE protocol `ReadableStream` to `Record`
- Decode and read any protocol `ReadableStream`

## Use

Common `ReadableStream` instances, such as `await fetch(...).body`, usage example:

```ts | pure
import { XStream } from "@antdv-next/x-sdk";

async function request() {
  const response = await fetch();
  // .....

  for await (const chunk of XStream({
    readableStream: response.body,
  })) {
    console.log(chunk);
  }
}
```

## Code Demo

<demo src="./demo/x-stream-default-protocol.vue">Default Protocol - SSE</demo>
<demo src="./demo/x-stream-custom-protocol.vue">Custom Protocol</demo>

## API

### XStreamOptions

| Property        | Description                                               | Type                         | Default            | Version |
| --------------- | --------------------------------------------------------- | ---------------------------- | ------------------ | ------- |
| readableStream  | Readable stream of binary data                            | ReadableStream<'Uint8Array'> | -                  | -       |
| transformStream | Support customizable transformStream to transform streams | TransformStream<string, T>   | sseTransformStream | -       |
| streamSeparator | Stream separator, used to separate different data streams | string                       | \n\n               | 2.2.0   |
| partSeparator   | Part separator, used to separate different parts of data  | string                       | \n                 | 2.2.0   |
| kvSeparator     | Key-value separator, used to separate keys and values     | string                       | :                  | 2.2.0   |
