import { afterEach, describe, expect, it, vi } from "vitest";
import { InvalidImageError, prepareTruckImage } from "./image";

const file = (type: string, sizeBytes = 1024) => {
  const blob = new File(["image-bytes"], "photo", { type });
  Object.defineProperty(blob, "size", { value: sizeBytes });
  return blob;
};

describe("prepareTruckImage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("rejects unsupported formats", async () => {
    await expect(prepareTruckImage(file("image/gif"))).rejects.toBeInstanceOf(
      InvalidImageError
    );
  });

  it("rejects files larger than 5 MB", async () => {
    await expect(
      prepareTruckImage(file("image/png", 6 * 1024 * 1024))
    ).rejects.toThrow("A imagem deve ter no máximo 5 MB.");
  });

  it("downsizes large photos to 640px and re-encodes them as JPEG", async () => {
    const drawImage = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 1920, height: 1080, close: vi.fn() })
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    const toDataURL = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/jpeg;base64,resized");

    await expect(prepareTruckImage(file("image/png"))).resolves.toBe(
      "data:image/jpeg;base64,resized"
    );
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 640, 360);
    expect(toDataURL).toHaveBeenCalledWith("image/jpeg", 0.82);
  });

  it("falls back to the original file when it cannot be decoded", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("unsupported"))
    );

    await expect(prepareTruckImage(file("image/webp"))).resolves.toMatch(
      /^data:image\/webp;base64,/
    );
  });
});
