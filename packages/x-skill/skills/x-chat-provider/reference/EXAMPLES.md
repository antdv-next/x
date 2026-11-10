## Scenario1: OpenAI Format

OpenAI format uses the built-in provider `OpenAIChatProvider`. The request must be manual because the Provider controls when it runs:

```ts
import { OpenAIChatProvider, XRequest } from "@antdv-next/x-sdk";

const provider = new OpenAIChatProvider({
  request: XRequest("https://api.openai.com/v1/chat/completions", {
    manual: true,
  }),
});
```

## Scenario2: DeepSeek Format

DeepSeek format uses the built-in provider `DeepSeekChatProvider`:

```ts
import { DeepSeekChatProvider, XRequest } from "@antdv-next/x-sdk";

const provider = new DeepSeekChatProvider({
  request: XRequest("https://api.deepseek.com/v1/chat/completions", {
    manual: true,
  }),
});
```

## Scenario3: Custom Provider

### 1. Custom Error Format

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
    // Keep the accumulated message on malformed payloads.
  }

  // Normal accumulation/processing logic
  return originMessage ?? { content: "", role: "assistant" };
}
```

### 2. Multi-field Response

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
    metadata: chunk?.metadata, // Extend MyMessage type if needed
  };
}
```
