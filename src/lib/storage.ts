import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Almacenamiento local en disco. Para producción (Vercel) se reemplaza por
// Vercel Blob, Cloudinary o S3 manteniendo estas mismas funciones.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function resolveSafe(relativePath: string) {
  const full = path.resolve(UPLOAD_DIR, relativePath);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) throw new Error("Ruta inválida");
  return full;
}

export async function saveImage(folder: string, file: File): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Formato de imagen no soportado");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("La imagen supera los 8 MB");

  const relativePath = `${folder}/${crypto.randomUUID()}.${ext}`;
  const full = resolveSafe(relativePath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));
  return relativePath;
}

export async function readImage(relativePath: string) {
  return readFile(resolveSafe(relativePath));
}

export async function deleteImage(relativePath: string) {
  try {
    await unlink(resolveSafe(relativePath));
  } catch {
    // Si el archivo ya no existe no hay nada que borrar.
  }
}
