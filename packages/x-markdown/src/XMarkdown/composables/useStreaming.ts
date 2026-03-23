import { ref, watch, type Ref } from "vue";

import type {
  StreamCache,
  StreamCacheTokenType,
  StreamingOption,
} from "../interface";

import { StreamCacheTokenType as TokenType } from "../interface";

const STREAM_INCOMPLETE_REGEX: Record<string, RegExp[]> = {
  image: [
    /^!\[[^\]\r\n]{0,1000}$/,
    /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/,
  ],
  link: [/^\[[^\]\r\n]{0,1000}$/, /^\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/],
  emphasis: [/^\*{1,3}[^*]*$/, /^_{1,3}[^_]*$/],
  inlineCode: [/^`[^`\r\n]{0,1000}$/, /^``[^`]*$/],
  html: [/^<[a-zA-Z][^>]*$/],
};

const INCOMPLETE_TOKENS: StreamCacheTokenType[] = [
  TokenType.Link,
  TokenType.Image,
  TokenType.Emphasis,
  TokenType.InlineCode,
  TokenType.Html,
];

export function useStreaming(
  content: Ref<string>,
  streaming: Ref<StreamingOption | undefined>,
) {
  const streamCache = ref<StreamCache>({
    pending: "",
    token: TokenType.Text,
    processedLength: 0,
    completeMarkdown: "",
  });

  const isInCodeBlock = ref(false);
  const codeBlockEndPattern = /```\s*$|~~~\s*$/;

  const processedContent = ref("");

  function processChunk(chunk: string): void {
    if (!chunk) return;

    const currentContent = content.value;
    const opts = streaming.value;

    if (!opts?.hasNextChunk) {
      streamCache.value.completeMarkdown = currentContent;
      streamCache.value.pending = "";
      processedContent.value = streamCache.value.completeMarkdown;
      return;
    }

    streamCache.value.pending += chunk;
    flushPending(opts);
    processedContent.value =
      streamCache.value.completeMarkdown + streamCache.value.pending;
  }

  function flushPending(opts: StreamingOption): void {
    let pending = streamCache.value.pending;

    if (isInCodeBlock.value) {
      if (codeBlockEndPattern.test(pending)) {
        isInCodeBlock.value = false;
        streamCache.value.completeMarkdown += pending;
        streamCache.value.pending = "";
      } else {
        streamCache.value.pending = pending;
      }
      return;
    }

    if (pending.startsWith("```") || pending.startsWith("~~~")) {
      const fenceMatch = pending.match(
        /^```[^`\n]*\n[\s\S]*?$|^~~~[^~\n]*\n[\s\S]*?$/,
      );
      if (fenceMatch) {
        isInCodeBlock.value = true;
        streamCache.value.completeMarkdown += fenceMatch[0].replace(
          /\n[\s\S]*$/,
          "\n",
        );
        streamCache.value.pending = pending.slice(fenceMatch[0].length);
        return;
      }
    }

    for (const tokenType of INCOMPLETE_TOKENS) {
      const patterns =
        STREAM_INCOMPLETE_REGEX[tokenType.toLowerCase().replace("-", "")];
      if (!patterns) continue;

      for (const pattern of patterns) {
        if (pattern.test(pending)) {
          streamCache.value.token = tokenType;
          if (!opts.hasNextChunk) {
            handleIncompleteToken(pending, opts);
          }
          return;
        }
      }
    }

    streamCache.value.completeMarkdown += pending;
    streamCache.value.pending = "";
    streamCache.value.token = TokenType.Text;
  }

  function handleIncompleteToken(pending: string, opts: StreamingOption): void {
    const tokenType = streamCache.value.token;
    const incompleteComponent =
      opts.incompleteMarkdownComponentMap?.[tokenType];

    if (incompleteComponent) {
      streamCache.value.completeMarkdown += `<${incompleteComponent}></${incompleteComponent}>`;
    } else {
      streamCache.value.completeMarkdown += pending;
    }

    streamCache.value.pending = "";
  }

  function reset(): void {
    streamCache.value = {
      pending: "",
      token: TokenType.Text,
      processedLength: 0,
      completeMarkdown: "",
    };
    isInCodeBlock.value = false;
    processedContent.value = "";
  }

  watch(
    content,
    (newContent, oldContent) => {
      if (!streaming.value?.hasNextChunk) {
        streamCache.value.completeMarkdown = newContent;
        streamCache.value.pending = "";
        processedContent.value = newContent;
        return;
      }

      const delta = newContent.slice((oldContent || "").length);
      processChunk(delta);
    },
    { immediate: true },
  );

  return {
    processedContent,
    reset,
  };
}
