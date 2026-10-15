import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TRUCKS } from "../__mocks__/trucks-server.mock";
import { server } from "../tests/mock-server";
import { useGetTrucks } from "./get-trucks";

describe("useGetTrucks", () => {
  it("should return truck data when the request is successful", async () => {
    TRUCKS.forEach((truck) => server.create("truck", truck));

    const { result } = renderHook(() => useGetTrucks());

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(result.current.data).toEqual(TRUCKS);
    expect(result.current.error).toBeUndefined();
  });
});
