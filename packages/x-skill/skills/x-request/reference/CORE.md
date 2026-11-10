# 1. Built-in Default Configuration

XRequest has built-in reasonable default configurations, **no additional configuration needed to use**.

**Built-in Default Values**:

- `method: 'POST'`
- `headers: { 'Content-Type': 'application/json' }`

# 2. Security Configuration

## 🔐 Authentication Configuration Comparison

| Environment Type     | Configuration Method             | Security  | Example                       |
| -------------------- | -------------------------------- | --------- | ----------------------------- |
| **Frontend Browser** | ❌ Prohibit direct configuration | Dangerous | Keys will be exposed to users |
| **Node.js**          | ✅ Environment variables         | Safe      | `process.env.API_KEY`         |
| **Proxy Service**    | ✅ Same-origin proxy             | Safe      | `/api/proxy/chat`             |

## 🛡️ Security Configuration Templates

**Node.js Environment Security Configuration**:

```typescript
const nodeConfig = {
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
};
```

**Frontend Environment Security Configuration**:

```typescript
const browserConfig = {
  baseURL: "/api/proxy/openai", // Through same-origin proxy
};
```

# 3. Basic Usage

```typescript
import { XRequest } from "@antdv-next/x-sdk";

// ⚠️ Note: The following examples apply to Node.js environment
// Frontend environments should use proxy services to avoid token leakage
const request = XRequest("https://your-api.com/chat", {
  headers: {
    Authorization: "Bearer your-token", // ⚠️ Only for Node.js environment
  },
  params: {
    query: "Hello",
  },
  // `manual` is omitted so the request starts immediately and callbacks fire.
  // Set `manual: true` only when the caller (e.g. a Chat Provider) controls `run()`.
  callbacks: {
    onSuccess: messages => {
      setStatus("success");
      console.log("onSuccess", messages);
    },
    onError: error => {
      setStatus("error");
      console.error("onError", error);
    },
    onUpdate: msg => {
      setLines(pre => [...pre, msg]);
      console.log("onUpdate", msg);
    },
  },
});
```

> ⚠️ **Important Reminder**: When XRequest is used in x-chat-provider or use-x-chat provider, `manual: true` is a required configuration, otherwise `AbstractChatProvider` throws `request must be manual`.

### With Parameters

```typescript
const request = XRequest("https://your-api.com/chat", {
  params: {
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  },
});
```

`params` is merged into the JSON body. XRequest always sends `POST`; a `method: "GET"` option is overridden by the implementation.

# 4. Streaming Configuration

## 🔄 Streaming Response Configuration

```typescript
// Streaming response configuration (AI conversation scenarios)
const streamConfig = {
  params: {
    stream: true, // Enable streaming response
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  },
  manual: true, // Manual control of requests
};

// Non-streaming response configuration (regular API scenarios)
const jsonConfig = {
  params: {
    stream: false, // Disable streaming response
  },
};
```

# 5. Dynamic Request Headers

```typescript
// ❌ Unsafe: Frontend directly exposes API key
// const request = XRequest('https://your-api.com/chat', {
//   headers: {
//     'Authorization': `Bearer ${apiKey}`, // Don't do this!
//   },
//   params: {
//     messages: [{ role: 'user', content: 'Hello' }],
//   },
// });

// ✅ Safe: Node.js environment uses environment variables
const request = XRequest("https://your-api.com/chat", {
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`, // Safe for Node.js environment
  },
  params: {
    messages: [{ role: "user", content: "Hello" }],
  },
});

// ✅ Safe: Frontend uses proxy service
const request = XRequest("/api/proxy/chat", {
  headers: {
    // No Authorization needed, handled by backend proxy
  },
  params: {
    messages: [{ role: "user", content: "Hello" }],
  },
});
```

# 6. Custom Stream Transformers

When AI service providers return non-standard formats, use `transformStream` for custom data transformation. XRequest decodes the response body to UTF-8 strings first, so the transformer receives `string` chunks and must enqueue the `Output` objects your callbacks expect.

#### Basic Example

```typescript
// Output is { content: string } here
const request = XRequest<{ message: string }, { content: string }>(
  "https://api.example.com/chat",
  {
    params: { message: "Hello" },
    transformStream: () =>
      new TransformStream({
        transform(chunk, controller) {
          // `chunk` is already a decoded string; do not call TextDecoder again
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data !== "[DONE]") {
                controller.enqueue({ content: data });
              }
            }
          }
        },
      }),
  },
);
```

#### Common Transformation Templates

```typescript
// OpenAI SSE format: reuse this factory so every request gets a new stream
const openaiStream = () =>
  new TransformStream({
    transform(chunk, controller) {
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content || "";
        if (content) {
          controller.enqueue({ content });
        }
      }
    },
  });

// Usage example
const request = XRequest(url, {
  params: { message: "Hello" },
  transformStream: openaiStream,
});
```

> ⚠️ **Note**: A Web `ReadableStream` can be locked by only one reader, so never reuse a `TransformStream` instance. Always pass a factory (`() => new TransformStream(...)`), as above. A chunk may also end mid-line in an SSE event; production parsers should buffer the trailing partial line.
