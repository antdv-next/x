# XRequest API

## XRequestFunction

```ts
type XRequestFunction<Input = AnyObject, Output = SSEOutput> = (
  baseURL: MaybeRef<string>,
  options?: XRequestConfigOptions<Input, Output>,
) => AbstractXRequestClass<Input, Output>;
```

`baseURL` may be a string or a ref. `options` is optional; the request runs immediately unless `manual: true`.

## XRequestConfigOptions

| Property        | Description                                                                                           | Type                                                                                                                                      | Default            |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| callbacks       | Request callbacks                                                                                     | `XRequestCallbacks<Output>`                                                                                                               | -                  |
| params          | Request parameters. Merged into the JSON body                                                         | `MaybeRef<Partial<Input>>`                                                                                                                | -                  |
| headers         | Additional request headers. Merged over global headers                                                | `MaybeRef<Record<string, string>>`                                                                                                        | -                  |
| timeout         | Time from sending the request to connecting to the service, in ms                                     | `MaybeRef<number>`                                                                                                                        | -                  |
| streamTimeout   | Maximum interval between chunks in stream mode, in ms                                                 | `MaybeRef<number>`                                                                                                                        | -                  |
| fetch           | Custom fetch implementation                                                                           | `(baseURL: Parameters<typeof fetch>[0], options: XRequestOptions<Input, Output>) => Promise<Response>`                                    | `globalThis.fetch` |
| middlewares     | Pre/post request middlewares                                                                          | `XFetchMiddlewares<Input, Output>`                                                                                                        | -                  |
| transformStream | Custom stream transformer. Also accepts a factory receiving `(baseURL, responseHeaders)`              | `XStreamOptions<Output>["transformStream"] \| ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>["transformStream"])` | -                  |
| streamSeparator | Separates stream events. Ignored when `transformStream` is set                                        | `MaybeRef<string>`                                                                                                                        | `"\n\n"`           |
| partSeparator   | Separates parts inside one event. Ignored when `transformStream` is set                               | `MaybeRef<string>`                                                                                                                        | `"\n"`             |
| kvSeparator     | Separates key and value inside a part. Ignored when `transformStream` is set                          | `MaybeRef<string>`                                                                                                                        | `":"`              |
| manual          | When `true`, the request is not sent until `run()` is called. Required when passed to a Chat Provider | `MaybeRef<boolean>`                                                                                                                       | `false`            |
| retryInterval   | Retry interval in ms. No retry when unset                                                             | `MaybeRef<number>`                                                                                                                        | -                  |
| retryTimes      | Maximum retry attempts                                                                                | `MaybeRef<number>`                                                                                                                        | -                  |

> Other `RequestInit` fields are forwarded, but `method` is always set to `POST` by the implementation. There is no `GET` mode.

## XRequestCallbacks

| Property  | Description                                                                                                                                                      | Type                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| onSuccess | Success callback. When used with a Chat Provider, also receives the assembled message                                                                            | `(chunks: Output[], responseHeaders: Headers, message?: MessageInfo<ChatMessage>) => void`                   |
| onError   | Error callback. When used with a Chat Provider, also receives the fallback message. Returning a number uses it as the retry interval (overrides `retryInterval`) | `(error: Error, errorInfo?: any, responseHeaders?: Headers, fallbackMsg?: MessageInfo<ChatMessage>) => void` |
| onUpdate  | Incremental update callback. When used with a Chat Provider, also receives the assembled message                                                                 | `(chunk: Output, responseHeaders: Headers, message?: MessageInfo<ChatMessage>) => void`                      |

## AbstractXRequestClass / XRequestClass

| Member          | Description                                               | Type                                                                                |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| baseURL         | Base URL (may be a ref)                                   | `MaybeRef<string>`                                                                  |
| options         | Request options                                           | `XRequestConfigOptions<Input, Output>`                                              |
| run             | Manually execute the request (only when `manual` is true) | `(params?: Input) => boolean`                                                       |
| abort           | Abort the request                                         | `() => void`                                                                        |
| manual          | Whether manual mode is active                             | `boolean`                                                                           |
| isTimeout       | Whether the connect timeout fired                         | `boolean`                                                                           |
| isStreamTimeout | Whether the stream chunk timeout fired                    | `boolean`                                                                           |
| isRequesting    | Whether the request is in flight                          | `boolean`                                                                           |
| state           | Readonly reactive state                                   | `Readonly<{ isTimeout: boolean; isStreamTimeout: boolean; isRequesting: boolean }>` |
| asyncHandler    | Promise for the current request                           | `Promise<any>`                                                                      |

## setXRequestGlobalOptions

```ts
type setXRequestGlobalOptions<Input, Output> = (
  options: XRequestGlobalOptions<Input, Output>,
) => void;
```

`XRequestGlobalOptions` is a `Pick` of `headers`, `timeout`, `streamTimeout`, `middlewares`, `fetch`, `transformStream`, and `manual`.

## XFetchMiddlewares

```ts
interface XFetchMiddlewares<Input, Output> {
  onRequest?: (
    baseURL: Parameters<typeof fetch>[0],
    options: XRequestOptions<Input, Output>,
  ) => Promise<[Parameters<typeof fetch>[0], XRequestOptions<Input, Output>]>;
  onResponse?: (response: Response) => Promise<Response>;
}
```

## Response handling

- `text/event-stream`: split with `streamSeparator` (`\n\n` by default), then `partSeparator` (`\n`), then `kvSeparator` (`:`). Repeated `data` fields in one event are joined with `\n`; a multi-character `kvSeparator` is fully consumed.
- `application/json`: parsed as one chunk. If the payload has `success: false`, an `Error` is created from `message` / `name`, `onError` is called with the payload as `errorInfo`, and the request finishes. Otherwise `onUpdate` and `onSuccess([chunk])` are called.
- Any other content type throws `The response content-type: ... is not support!`.

## FAQ

### transformStream causes stream locking on the second request

The Web Streams API allows a stream to be locked by only one reader. Return a new stream from a factory instead of reusing one instance:

```ts
const provider = ref(
  new CustomProvider({
    request: XRequest(url, {
      manual: true,
      // ✅ A new TransformStream per request
      transformStream: () =>
        new TransformStream({
          transform(chunk, controller) {
            controller.enqueue({ data: chunk });
          },
        }),
    }),
  }),
);
```

```ts
// ❌ Reusing the same TransformStream instance across requests
const request = XRequest(url, {
  manual: true,
  transformStream: new TransformStream({ ... }),
});
```
