import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las fotos van a Supabase Storage y se guarda su URL
// pública. Sin ellas (desarrollo) van a la carpeta uploads/ y se sirven por /api/fotos.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "fotos";

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

let client: SupabaseClient | null = null;
function supabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Crea el bucket público de fotos la primera vez que hace falta. */
async function ensureBucket(sb: SupabaseClient) {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Object.keys(ALLOWED_IMAGE_TYPES),
  });
  if (error && !/already exists/i.test(error.message)) throw new Error(`No se pudo crear el bucket: ${error.message}`);
}

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
  const sb = supabase();
  if (sb) {
    const upload = () =>
      sb.storage.from(BUCKET).upload(name, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    let { error } = await upload();
    if (error && /bucket not found/i.test(error.message)) {
      await ensureBucket(sb);
      ({ error } = await upload());
    }
    if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
    return sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }

  const full = resolveSafe(name);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function readImage(relativePath: string) {
  return readFile(resolveSafe(relativePath));
}

export async function deleteImage(storedPath: string) {
  try {
    if (/^https?:\/\//.test(storedPath)) {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const index = storedPath.indexOf(marker);
      const sb = supabase();
      if (sb && index !== -1) {
        await sb.storage.from(BUCKET).remove([decodeURIComponent(storedPath.slice(index + marker.length))]);
      }
      return;
    }
    await unlink(resolveSafe(storedPath));
  } catch {
    // Si el archivo ya no existe (o no se pudo borrar) la foto igual se quita del auto.
  }
}
