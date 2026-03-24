import type { Component } from "vue";

import { ref, watch, type Ref } from "vue";

import type {
  StreamCache,
  StreamCacheTokenType,
  StreamingOption,
} from "../interface";

import { StreamCacheTokenType as TokenType } from "../interface";

interface Recognizer {
  tokenType: StreamCacheTokenType;
  isStartOfToken: (markdown: string) => boolean;
  isStreamingValid: (markdown: string) => boolean;
  getCommitPrefix?: (pending: string) => string | null;
}

const STREAM_INCOMPLETE_REGEX = {
  image: [
    /^!\[[^\]\r\n]{0,1000}$/,
    /^!\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/,
  ],
  link: [/^\[[^\]\r\n]{0,1000}$/, /^\[[^\r\n]{0,1000}\]\(*[^)\r\n]{0,1000}$/],
  html: [/^<\/$/, /^<\/?[a-zA-Z][a-zA-Z0-9-]{0,100}[^>\r\n]{0,1000}$/],
  commonEmphasis: [/^(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/],
  list: [
    /^[-+*]\s{0,3}$/,
    /^[-+*]\s{1,3}(\*{1,3}|_{1,3})(?!\s)(?!.*\1$)[^\r\n]{0,1000}$/,
  ],
  "inline-code": [/^`[^`\r\n]{0,300}$/],
} as const;

const isTableInComplete = (markdown: string) => {
  if (markdown.includes("\n\n")) return false;

  const lines = markdown.split("\n");
  if (lines.length <= 1) return true;

  const [header, separator] = lines;
  const trimmedHeader = header.trim();
  if (!/^\|.*\|$/.test(trimmedHeader)) return false;

  const trimmedSeparator = separator.trim();
  const columns = trimmedSeparator
    .split("|")
    .map(col => col.trim())
    .filter(Boolean);

  const separatorRegex = /^:?-+:?$/;
  return columns.every((col, index) =>
    index === columns.length - 1
      ? col === ":" || separatorRegex.test(col)
      : separatorRegex.test(col),
  );
};

const tokenRecognizerMap: Partial<Record<StreamCacheTokenType, Recognizer>> = {
  [TokenType.Link]: {
    tokenType: TokenType.Link,
    isStartOfToken: markdown => markdown.startsWith("["),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.link.some(re => re.test(markdown)),
  },
  [TokenType.Image]: {
    tokenType: TokenType.Image,
    isStartOfToken: markdown => markdown.startsWith("!"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.image.some(re => re.test(markdown)),
  },
  [TokenType.Html]: {
    tokenType: TokenType.Html,
    isStartOfToken: markdown => markdown.startsWith("<"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.html.some(re => re.test(markdown)),
  },
  [TokenType.Emphasis]: {
    tokenType: TokenType.Emphasis,
    isStartOfToken: markdown =>
      markdown.startsWith("*") || markdown.startsWith("_"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.commonEmphasis.some(re => re.test(markdown)),
  },
  [TokenType.List]: {
    tokenType: TokenType.List,
    isStartOfToken: markdown => /^[-+*]/.test(markdown),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX.list.some(re => re.test(markdown)),
    getCommitPrefix: (pending: string) => {
      const listPrefix = pending.match(/^([-+*]\s{0,3})/)?.[1];
      const rest = listPrefix ? pending.slice(listPrefix.length) : "";
      return listPrefix && rest.startsWith("`") ? listPrefix : null;
    },
  },
  [TokenType.Table]: {
    tokenType: TokenType.Table,
    isStartOfToken: markdown => markdown.startsWith("|"),
    isStreamingValid: isTableInComplete,
  },
  [TokenType.InlineCode]: {
    tokenType: TokenType.InlineCode,
    isStartOfToken: markdown => markdown.startsWith("`"),
    isStreamingValid: markdown =>
      STREAM_INCOMPLETE_REGEX["inline-code"].some(re => re.test(markdown)),
  },
};

const recognize = (
  cache: StreamCache,
  tokenType: StreamCacheTokenType,
): void => {
  const recognizer = tokenRecognizerMap[tokenType];
  if (!recognizer) return;

  const { token, pending } = cache;
  if (token === TokenType.Text && recognizer.isStartOfToken(pending)) {
    cache.token = tokenType;
    return;
  }

  if (token === tokenType && !recognizer.isStreamingValid(pending)) {
    const prefix = recognizer.getCommitPrefix?.(pending);
    if (prefix) {
      cache.completeMarkdown += prefix;
      cache.pending = pending.slice(prefix.length);
      cache.token = TokenType.Text;
      return;
    }
    commitCache(cache);
  }
};

const recognizeHandlers = Object.values(tokenRecognizerMap).filter(
  (recognizer): recognizer is Recognizer => Boolean(recognizer),
);

const getInitialCache = (): StreamCache => ({
  pending: "",
  token: TokenType.Text,
  processedLength: 0,
  completeMarkdown: "",
});

const commitCache = (cache: StreamCache): void => {
  if (cache.pending) {
    cache.completeMarkdown += cache.pending;
    cache.pending = "";
  }
  cache.token = TokenType.Text;
};

const isInCodeBlock = (text: string, isFinalChunk = false): boolean => {
  const lines = text.split("\n");
  let inFenced = false;
  let fenceChar = "";
  let fenceLen = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;

    const match = line.match(/^(`{3,}|~{3,})(.*)$/);
    if (!match) continue;

    const fence = match[1];
    const after = match[2];
    const char = fence[0];
    const len = fence.length;

    if (!inFenced) {
      inFenced = true;
      fenceChar = char;
      fenceLen = len;
      continue;
    }

    const isValidEnd =
      char === fenceChar && len >= fenceLen && /^\s*$/.test(after);
    if (isValidEnd && (isFinalChunk || i < lines.length - 1)) {
      inFenced = false;
      fenceChar = "";
      fenceLen = 0;
    }
  }

  return inFenced;
};

const sanitizeForURIComponent = (input: string): string => {
  let result = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      if (
        i + 1 < input.length &&
        input.charCodeAt(i + 1) >= 0xdc00 &&
        input.charCodeAt(i + 1) <= 0xdfff
      ) {
        result += input[i] + input[i + 1];
        i++;
      }
    } else if (charCode < 0xdc00 || charCode > 0xdfff) {
      result += input[i];
    }
  }
  return result;
};

const safeEncodeURIComponent = (str: string): string => {
  try {
    return encodeURIComponent(str);
  } catch (error) {
    if (error instanceof URIError) {
      return encodeURIComponent(sanitizeForURIComponent(str));
    }
    return "";
  }
};

export function useStreaming(
  content: Ref<string>,
  streaming: Ref<StreamingOption | undefined>,
  components?: Ref<Record<string, Component> | undefined>,
) {
  const streamCache = ref<StreamCache>(getInitialCache());
  const processedContent = ref("");

  function handleIncompleteMarkdown(
    cache: StreamCache,
    opts?: StreamingOption,
  ): string | undefined {
    const { token, pending } = cache;
    if (token === TokenType.Text) return undefined;

    if (token === TokenType.Image && pending === "!") {
      return undefined;
    }

    if (token === TokenType.Table && pending.split("\n").length > 2) {
      return pending;
    }

    const componentName =
      opts?.incompleteMarkdownComponentMap?.[token] ?? `incomplete-${token}`;

    if (!components?.value?.[componentName]) {
      return undefined;
    }

    const encodedPending = safeEncodeURIComponent(pending);
    return `<${componentName} data-raw="${encodedPending}" />`;
  }

  function processStreaming(text: string, opts?: StreamingOption): void {
    if (!text) {
      processedContent.value = "";
      streamCache.value = getInitialCache();
      return;
    }

    const expectedPrefix =
      streamCache.value.completeMarkdown + streamCache.value.pending;

    if (!text.startsWith(expectedPrefix)) {
      streamCache.value = getInitialCache();
    }

    const cache = streamCache.value;
    const chunk = text.slice(cache.processedLength);

    if (!chunk) {
      const incompletePlaceholder = handleIncompleteMarkdown(cache, opts);
      processedContent.value =
        cache.completeMarkdown + (incompletePlaceholder || "");
      return;
    }

    cache.processedLength += chunk.length;

    for (const char of chunk) {
      cache.pending += char;

      const inCodeBlock = isInCodeBlock(cache.completeMarkdown + cache.pending);
      if (inCodeBlock) {
        commitCache(cache);
        continue;
      }

      if (cache.token === TokenType.Text) {
        for (const handler of recognizeHandlers) {
          recognize(cache, handler.tokenType);
        }
      } else {
        const currentHandler = recognizeHandlers.find(
          handler => handler.tokenType === cache.token,
        );
        if (currentHandler) {
          recognize(cache, currentHandler.tokenType);
        }

        const tokenAfterRecognize = cache.token as StreamCacheTokenType;
        if (tokenAfterRecognize === TokenType.Text) {
          for (const handler of recognizeHandlers) {
            recognize(cache, handler.tokenType);
          }
        }
      }

      if (cache.token === TokenType.Text) {
        commitCache(cache);
      }
    }

    const incompletePlaceholder = handleIncompleteMarkdown(cache, opts);
    processedContent.value =
      cache.completeMarkdown + (incompletePlaceholder || "");
  }

  function reset(): void {
    streamCache.value = getInitialCache();
    processedContent.value = "";
  }

  watch(
    [content, () => streaming.value?.hasNextChunk],
    ([newContent, hasNextChunk]) => {
      const opts = streaming.value;
      const enableCache = Boolean(hasNextChunk);

      if (!enableCache) {
        processedContent.value = newContent;
        streamCache.value = {
          pending: "",
          token: TokenType.Text,
          processedLength: newContent.length,
          completeMarkdown: newContent,
        };
        return;
      }

      processStreaming(newContent, opts);
    },
    { immediate: true },
  );

  return {
    processedContent,
    reset,
  };
}
