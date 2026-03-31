import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import XRequest from "../index";

interface RequestInput {
  a?: number;
  b?: number;
}

describe("XRequest", () => {
  it("uses reactive baseURL / params / headers refs on each run", async () => {
    const baseURL = ref("https://example.com/api/v1");
    const params = ref<Partial<RequestInput>>({ a: 1 });
    const headers = ref<Record<string, string>>({
      Authorization: "Bearer token-1",
    });

    const fetchMock = vi.fn(
      async (_url: Parameters<typeof fetch>[0], _options: RequestInit) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        });
      },
    );

    const request = XRequest<RequestInput, { success: boolean }>(baseURL, {
      manual: true,
      params,
      headers,
      fetch: fetchMock as any,
    });

    request.run({ b: 2 });
    await request.asyncHandler;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    const firstUrl = firstCall[0] as string;
    const firstOptions = firstCall[1] as unknown as RequestInit;

    expect(firstUrl).toBe("https://example.com/api/v1");
    expect(JSON.parse(firstOptions.body as string)).toEqual({ a: 1, b: 2 });
    expect((firstOptions.headers as Record<string, string>).Authorization).toBe(
      "Bearer token-1",
    );

    baseURL.value = "https://example.com/api/v2";
    params.value = { a: 3 };
    headers.value = { Authorization: "Bearer token-2" };

    request.run({ b: 4 });
    await request.asyncHandler;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCall = fetchMock.mock.calls[1];
    const secondUrl = secondCall[0] as string;
    const secondOptions = secondCall[1] as unknown as RequestInit;

    expect(secondUrl).toBe("https://example.com/api/v2");
    expect(JSON.parse(secondOptions.body as string)).toEqual({ a: 3, b: 4 });
    expect(
      (secondOptions.headers as Record<string, string>).Authorization,
    ).toBe("Bearer token-2");
  });

  it("tracks reactive manual option", () => {
    const manual = ref(true);

    const request = XRequest("https://example.com/manual", {
      manual,
      fetch: vi.fn() as any,
    });

    expect(request.manual).toBe(true);
    manual.value = false;
    expect(request.manual).toBe(false);
    manual.value = true;
    expect(request.manual).toBe(true);
  });

  it("supports plain middlewares object", async () => {
    const onRequest = vi.fn(
      async (baseURL: Parameters<typeof fetch>[0], options: RequestInit) => {
        return [`${baseURL.toString()}?mw=1`, options as any];
      },
    );
    const onResponse = vi.fn(async (response: Response) => response);

    const fetchMock = vi.fn(async (_url: Parameters<typeof fetch>[0]) => {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    });

    const request = XRequest("https://example.com/middlewares", {
      manual: true,
      fetch: fetchMock as any,
      middlewares: {
        onRequest: onRequest as any,
        onResponse,
      },
    });

    request.run();
    await request.asyncHandler;

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://example.com/middlewares?mw=1",
    );
  });
});
