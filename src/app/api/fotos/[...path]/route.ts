import { readImage } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(_request: Request, { params }: RouteContext<"/api/fotos/[...path]">) {
  const { path } = await params;
  const relativePath = path.join("/");
  const contentType = CONTENT_TYPES[relativePath.split(".").pop() ?? ""];
  if (!contentType) return new Response("No encontrado", { status: 404 });

  try {
    const file = await readImage(relativePath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        // Los nombres de archivo son únicos, así que se pueden cachear para siempre.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
