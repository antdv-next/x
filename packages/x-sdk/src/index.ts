export { AbstractXRequestClass, XRequest, XStream } from "@ant-design/x-sdk";

export type {
  SSEFields,
  SSEOutput,
  XReadableStream,
  XRequestCallbacks,
  XRequestClass,
  XRequestFunction,
  XRequestGlobalOptions,
  XRequestOptions,
  XStreamOptions,
} from "@ant-design/x-sdk";

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
