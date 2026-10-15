import { afterEach, describe, expect, it, vi } from "vitest";
import { fetcher } from "./fetcher";

const mockFetch = (response: Partial<Response>) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(response as Response);

describe("fetcher", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the trucks from the response body", async () => {
    mockFetch({
      ok: true,
      json: () => Promise.resolve({ trucks: ["truck1", "truck2"] }),
    });

    const result = await fetcher("/api/caminhoes");

    expect(result).toEqual(["truck1", "truck2"]);
    expect(fetch).toHaveBeenCalledWith("/api/caminhoes");
  });

  it("should throw when the response is not successful", async () => {
    mockFetch({ ok: false, status: 500 });

    await expect(fetcher("/api/caminhoes")).rejects.toThrow(
      "Request to /api/caminhoes failed with status 500"
    );
  });
});
