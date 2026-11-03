import { describe, expect, it, vi } from "vitest";

import XRequest from "../index";

const baseURL = "https://api.example.com/v1/chat";
const errorResponse = {
  success: false,
  name: "ValidationError",
  message: "Invalid input parameters",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("XRequest JSON failure state", () => {
  it.each([true, false])(
    "finishes a business failure with callbacks=%s",
    async withCallbacks => {
      const callbackStates: boolean[] = [];
      const onError = vi.fn(() => {
        callbackStates.push(request.isRequesting);
      });
      const onSuccess = vi.fn();
      const onUpdate = vi.fn();
      const response = jsonResponse(errorResponse);
      const fetch = vi.fn().mockResolvedValue(response);
      const request = XRequest(baseURL, {
        manual: true,
        fetch,
        callbacks: withCallbacks ? { onError, onSuccess, onUpdate } : undefined,
      });

      request.run();
      expect(request.isRequesting).toBe(true);
      await request.asyncHandler;

      expect(request.isRequesting).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onUpdate).not.toHaveBeenCalled();
      expect(callbackStates).toEqual(withCallbacks ? [false] : []);
      if (withCallbacks) {
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            name: errorResponse.name,
            message: errorResponse.message,
          }),
          errorResponse,
          response.headers,
        );
      }
    },
  );

  it("keeps a new request started in onError active until its response arrives", async () => {
    const { promise: pendingResponse, resolve: resolveResponse } =
      Promise.withResolvers<Response>();
    const callbackStates: boolean[] = [];
    const onError = vi.fn(() => {
      callbackStates.push(request.isRequesting);
      request.run();
    });
    const onSuccess = vi.fn();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(errorResponse))
      .mockReturnValueOnce(pendingResponse);
    const request = XRequest(baseURL, {
      manual: true,
      fetch,
      callbacks: { onError, onSuccess },
    });

    request.run();
    const firstRequest = request.asyncHandler;
    await firstRequest;

    expect(callbackStates).toEqual([false]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(request.isRequesting).toBe(true);
    resolveResponse(jsonResponse({ success: true }));
    await request.asyncHandler;
    expect(request.isRequesting).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it.each(["response", "body"])(
    "keeps a newer request active when an older business failure is awaiting its %s",
    async pendingStage => {
      const olderResponse = jsonResponse(errorResponse);
      const { promise: pendingOlderResponse, resolve: resolveOlderResponse } =
        Promise.withResolvers<Response>();
      const { promise: pendingNewerResponse, resolve: resolveNewerResponse } =
        Promise.withResolvers<Response>();
      const { promise: pendingOlderBody, resolve: resolveOlderBody } =
        Promise.withResolvers<unknown>();
      const { promise: bodyStarted, resolve: notifyBodyStarted } =
        Promise.withResolvers<void>();
      vi.spyOn(olderResponse, "json").mockImplementation(() => {
        notifyBodyStarted();
        return pendingOlderBody as Promise<any>;
      });
      const callbackStates: boolean[] = [];
      const onError = vi.fn(() => {
        callbackStates.push(request.isRequesting);
      });
      const onSuccess = vi.fn();
      const onUpdate = vi.fn();
      const fetch = vi
        .fn()
        .mockReturnValueOnce(pendingOlderResponse)
        .mockReturnValueOnce(pendingNewerResponse);
      const request = XRequest(baseURL, {
        manual: true,
        fetch,
        callbacks: { onError, onSuccess, onUpdate },
      });

      request.run();
      const olderRequest = request.asyncHandler;
      if (pendingStage === "body") {
        resolveOlderResponse(olderResponse);
        await bodyStarted;
      }
      request.run();
      const newerRequest = request.asyncHandler;
      expect(request.isRequesting).toBe(true);

      resolveOlderResponse(olderResponse);
      resolveOlderBody(errorResponse);
      await olderRequest;

      expect(request.asyncHandler).toBe(newerRequest);
      expect(request.isRequesting).toBe(true);
      expect(callbackStates).toEqual([true]);
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: errorResponse.name,
          message: errorResponse.message,
        }),
        errorResponse,
        olderResponse.headers,
      );
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onUpdate).not.toHaveBeenCalled();

      resolveNewerResponse(jsonResponse({ success: true }));
      await newerRequest;
      expect(request.isRequesting).toBe(false);
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledTimes(1);
    },
  );
});
