const MAX_SIDE = 1920;
const MAX_BYTES = 3.5 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Achica una foto en el navegador antes de subirla: lado mayor de 1920 px y WebP
 * (o JPG si el navegador no sabe generar WebP). Una foto de celular de 8 MB queda en ~400 KB.
 */
export async function compressImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("No se pudo leer la imagen. Probá con una foto JPG o PNG.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.82, 0.7, 0.55]) {
    let blob = await toBlob(canvas, "image/webp", quality);
    // Algunos Safari devuelven PNG cuando no soportan WebP: en ese caso, JPG.
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= MAX_BYTES) {
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
    }
  }
  throw new Error("La imagen es demasiado grande incluso después de achicarla.");
}
