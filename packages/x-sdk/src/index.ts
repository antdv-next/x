export * from "./chat-providers";
export type {
  XModelMessage,
  XModelParams,
  XModelResponse,
} from "./chat-providers/types/model";
export type { DefaultMessageInfo, MessageInfo } from "./x-chat";
export { default as useXChat } from "./x-chat";
export type { ConversationData } from "./x-conversations";
export { default as useXConversations } from "./x-conversations";
export type {
  XRequestCallbacks,
  XRequestConfigOptions,
  XRequestClass,
  XRequestFunction,
  XRequestGlobalOptions,
  XRequestOptions,
} from "./x-request";
export {
  AbstractXRequestClass,
  default as XRequest,
  setXRequestGlobalOptions,
} from "./x-request";
export type {
  SSEFields,
  SSEOutput,
  XReadableStream,
  XStreamOptions,
} from "./x-stream";
export { default as XStream } from "./x-stream";

export interface XSdkClientOptions {
  baseURL: string;
  fetcher?: typeof fetch;
}

export interface RequestOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export class XSdkClient {
  private readonly baseURL: string;
  private readonly fetcher: typeof fetch;

  constructor(options: XSdkClientOptions) {
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.fetcher = options.fetcher ?? fetch;
  }

  async get<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await this.fetcher(
      `${this.baseURL}/${path.replace(/^\//, "")}`,
      {
        method: "GET",
        headers: options.headers,
        signal: options.signal,
      },
    );

    return response.json() as Promise<T>;
  }
}

export function createXSdkClient(options: XSdkClientOptions) {
  return new XSdkClient(options);
}
