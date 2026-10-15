import { describe, expect, it } from "vitest";
import { TRUCKS } from "../__mocks__/trucks-server.mock";
import { server } from "../tests/mock-server";
import { deleteTruck } from "./delete-truck";

describe("deleteTruck", () => {
  it("should successfully delete a truck", async () => {
    const mockTruck = TRUCKS[0];
    server.create("truck", mockTruck);

    const url = `/api/caminhao/${mockTruck.id}`;
    const result = await deleteTruck(url);

    expect(result).toEqual({ message: "Caminhão excluído com sucesso" });

    const deletedTruck = server.schema.find("truck", mockTruck.id);
    expect(deletedTruck).toBeNull();
  });

  it("should throw an error when the truck does not exist", async () => {
    const nonExistingId = "999";
    const url = `/api/caminhao/${nonExistingId}`;

    await expect(deleteTruck(url)).rejects.toThrowError(
      "Erro ao excluir caminhão"
    );
  });
});
