## 场景1：OpenAI 格式

OpenAI 格式使用内置 Provider `OpenAIChatProvider`。请求必须手动模式，由 Provider 控制发送时机：

```ts
import { OpenAIChatProvider, XRequest } from "@antdv-next/x-sdk";

const provider = new OpenAIChatProvider({
  request: XRequest("https://api.openai.com/v1/chat/completions", {
    manual: true,
  }),
});
```

## 场景2：DeepSeek 格式

DeepSeek 格式使用内置 Provider `DeepSeekChatProvider`：

```ts
import { DeepSeekChatProvider, XRequest } from "@antdv-next/x-sdk";

const provider = new DeepSeekChatProvider({
  request: XRequest("https://api.deepseek.com/v1/chat/completions", {
    manual: true,
  }),
});
```

## 场景3：自定义 Provider

### 1. 自定义错误格式

```ts
transformMessage(info) {
  const { originMessage, chunk } = info;

  if (!chunk?.data) {
    return originMessage ?? { content: "", role: "assistant" };
  }

  try {
    const data = JSON.parse(chunk.data);
    if (data.error) {
      return {
        ...originMessage,
        content: data.error.message,
        role: "assistant",
      };
    }
  } catch {
    // 解析失败时保留已累积消息
  }

  // 正常累加/处理逻辑
  return originMessage ?? { content: "", role: "assistant" };
}
```

### 2. 多字段响应

```ts
interface MyOutput {
  content: string;
  metadata?: {
    confidence: number;
    source: string;
  };
}

transformMessage(info) {
  const { originMessage, chunk } = info;

  return {
    ...originMessage,
    content: `${originMessage?.content || ""}${chunk?.content || ""}`,
    metadata: chunk?.metadata, // 需要时扩展 MyMessage 类型
  };
}
```
