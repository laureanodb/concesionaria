import "server-only";
import { del, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Con BLOB_READ_WRITE_TOKEN (Vercel) las fotos van a Vercel Blob y se guarda su URL.
// Sin él (desarrollo) van a la carpeta uploads/ y se sirven por /api/fotos.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
// Las fotos se achican en el navegador antes de subirlas (ver ImageManager),
// así que este tope solo frena archivos que no pasaron por ahí.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function resolveSafe(relativePath: string) {
  const full = path.resolve(UPLOAD_DIR, relativePath);
  if (!full.startsWith(UPLOAD_DIR + path.sep)) throw new Error("Ruta inválida");
  return full;
}

export async function saveImage(folder: string, file: File): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Formato de imagen no soportado");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("La imagen supera los 4 MB");

  const name = `${folder}/${crypto.randomUUID()}.${ext}`;
  if (useBlob) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  const relativePath = name;
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
    if (/^https?:\/\//.test(relativePath)) {
      await del(relativePath);
      return;
    }
    await unlink(resolveSafe(relativePath));
  } catch {
    // Si el archivo ya no existe (o no se pudo borrar) la foto igual se quita del auto.
  }
}
