import { describe, expect, it } from "vitest";
import { TRUCKS } from "../__mocks__/trucks-server.mock";
import { server } from "../tests/mock-server";
import { updateTruck } from "./update-truck";

describe("updateTruck", () => {
  it("should successfully update a truck", async () => {
    server.create("truck", TRUCKS[0]);
    const updatedTruck = { ...TRUCKS[0], license_plate: "XYZ-9876" };

    const result = await updateTruck(`/api/caminhao/${updatedTruck.id}`, {
      arg: updatedTruck,
    });

    expect(result).toEqual(updatedTruck);
    expect(server.schema.find("truck", updatedTruck.id)?.attrs).toEqual(
      updatedTruck
    );
  });

  it("should throw an error when the truck does not exist", async () => {
    const nonExistingTruck = { ...TRUCKS[0], id: "999" };

    await expect(
      updateTruck(`/api/caminhao/${nonExistingTruck.id}`, {
        arg: nonExistingTruck,
      })
    ).rejects.toThrowError("Erro ao atualizar caminhão");
  });
});
