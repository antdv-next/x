# 1. 内置默认配置

XRequest 已内置合理的默认配置，**无需额外配置即可使用**。

**内置默认值**:

- `method: 'POST'`
- `headers: { 'Content-Type': 'application/json' }`

# 2. 安全配置

## 🔐 认证配置对比

| 环境类型       | 配置方式        | 安全性 | 示例                  |
| -------------- | --------------- | ------ | --------------------- |
| **前端浏览器** | ❌ 禁止直接配置 | 危险   | 密钥会暴露给用户      |
| **Node.js**    | ✅ 环境变量     | 安全   | `process.env.API_KEY` |
| **代理服务**   | ✅ 同域代理     | 安全   | `/api/proxy/chat`     |

## 🛡️ 安全配置模板

**Node.js环境安全配置**:

```typescript
const nodeConfig = {
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
};
```

**前端环境安全配置**:

```typescript
const browserConfig = {
  baseURL: "/api/proxy/openai", // 通过同域代理
};
```

# 3. 基础使用

```typescript
import { XRequest } from "@antdv-next/x-sdk";

// ⚠️ 注意：以下示例适用于 Node.js 环境
// 前端环境请使用代理服务避免 token 泄漏
const request = XRequest("https://your-api.com/chat", {
  headers: {
    Authorization: "Bearer your-token", // ⚠️ 仅 Node.js 环境使用
  },
  params: {
    query: "你好",
  },
  // 没有设置 manual，请求会立即发起并触发回调。
  // 只有由调用方（如 Chat Provider）控制 run() 时才需要 manual: true。
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

> ⚠️ **重要提醒**：当 XRequest 用于 x-chat-provider 或 use-x-chat 的 provider 中时，`manual: true` 是必须的配置项，否则 `AbstractChatProvider` 会抛出 `request must be manual`。

### 带参数

```typescript
const request = XRequest("https://your-api.com/chat", {
  params: {
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  },
});
```

`params` 会合并进 JSON body。XRequest 始终发送 `POST`；传入 `method: "GET"` 也会被实现覆盖。

# 4. 流式配置

## 🔄 流式响应配置

```typescript
// 流式响应配置（AI对话场景）
const streamConfig = {
  params: {
    stream: true, // 启用流式响应
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
  },
  manual: true, // 手动控制请求
};

// 非流式响应配置（普通API场景）
const jsonConfig = {
  params: {
    stream: false, // 禁用流式响应
  },
};
```

# 5. 动态请求头

```typescript
// ❌ 不安全：前端直接暴露 API key
// const request = XRequest('https://your-api.com/chat', {
//   headers: {
//     'Authorization': `Bearer ${apiKey}`, // 不要这样做！
//   },
//   params: {
//     messages: [{ role: 'user', content: '你好' }],
//   },
// });

// ✅ 安全：Node.js 环境使用环境变量
const request = XRequest("https://your-api.com/chat", {
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`, // Node.js 环境安全
  },
  params: {
    messages: [{ role: "user", content: "你好" }],
  },
});

// ✅ 安全：前端使用代理服务
const request = XRequest("/api/proxy/chat", {
  headers: {
    // 不需要 Authorization，由后端代理处理
  },
  params: {
    messages: [{ role: "user", content: "你好" }],
  },
});
```

# 6. 自定义流转换器

当 AI 服务商返回非标准格式时，使用 `transformStream` 自定义数据转换。XRequest 会先把响应体按 UTF-8 解码为字符串，因此转换器收到的是 `string` 类型的 chunk，需要 enqueue 回调所期望的 `Output` 对象。

#### 基础示例

```typescript
// 这里 Output 为 { content: string }
const request = XRequest<{ message: string }, { content: string }>(
  "https://api.example.com/chat",
  {
    params: { message: "你好" },
    transformStream: () =>
      new TransformStream({
        transform(chunk, controller) {
          // chunk 已经是解码后的字符串，不要再调用 TextDecoder
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

#### 常用转换模板

```typescript
// OpenAI SSE 格式：使用工厂函数，保证每次请求都得到新的流
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

// 使用示例
const request = XRequest(url, {
  params: { message: "你好" },
  transformStream: openaiStream,
});
```

> ⚠️ **注意**：Web `ReadableStream` 只能被一个 reader 锁定，不要复用同一个 `TransformStream` 实例，始终传入工厂函数（`() => new TransformStream(...)`），如上例所示。另外，chunk 可能在一个 SSE 事件行中间结束，生产环境需要缓存末尾不完整的行。
