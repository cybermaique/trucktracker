import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/server";
import { ApiError, http } from "./http";

describe("http", () => {
  it("sends JSON and parses JSON responses", async () => {
    server.use(
      mswHttp.post("*/api/echo", async ({ request }) =>
        HttpResponse.json({
          received: await request.json(),
          contentType: request.headers.get("content-type"),
        })
      )
    );

    await expect(
      http("echo", { method: "POST", body: { hello: "world" } })
    ).resolves.toEqual({
      received: { hello: "world" },
      contentType: "application/json",
    });
  });

  it("resolves empty bodies to undefined", async () => {
    server.use(
      mswHttp.delete(
        "*/api/empty",
        () => new HttpResponse(null, { status: 204 })
      )
    );

    await expect(http("empty", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("throws an ApiError with the server message", async () => {
    server.use(
      mswHttp.get("*/api/broken", () =>
        HttpResponse.json({ message: "Falhou" }, { status: 503 })
      )
    );

    await expect(http("broken")).rejects.toEqual(
      new ApiError(503, "Falhou", { message: "Falhou" })
    );
  });

  it("falls back to a generic message for non-JSON errors", async () => {
    server.use(
      mswHttp.get("*/api/text", () => new HttpResponse("oops", { status: 500 }))
    );

    await expect(http("text")).rejects.toMatchObject({
      status: 500,
      message: "Request failed with status 500",
      body: "oops",
    });
  });
});
