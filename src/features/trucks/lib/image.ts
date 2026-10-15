export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION_PX = 640;

export class InvalidImageError extends Error {}

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Validates the file and downsizes it to at most 640px, re-encoded as JPEG.
 * Phone photos are several MB; a thumbnail keeps the mock database (persisted
 * in localStorage) small. Falls back to the original file when the browser
 * cannot decode it into a canvas.
 */
export async function prepareTruckImage(file: File): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new InvalidImageError("Envie uma imagem JPG, PNG ou WEBP.");
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new InvalidImageError(
      `A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB} MB.`
    );
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height)
    );
    const canvas = Object.assign(document.createElement("canvas"), {
      width: Math.round(bitmap.width * scale),
      height: Math.round(bitmap.height * scale),
    });
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context unavailable");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return readAsDataUrl(file);
  }
}
