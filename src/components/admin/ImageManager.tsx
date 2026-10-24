"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { deleteVehicleImage, moveVehicleImage, uploadVehicleImage } from "@/app/admin/actions/vehicles";
import { compressImage } from "@/lib/compress-image";

type Img = { id: string; url: string };

export function ImageManager({ vehicleId, images }: { vehicleId: string; images: Img[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  // Las fotos se suben de a una para no superar el límite de tamaño por pedido.
  function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    startTransition(async () => {
      const failed: string[] = [];
      for (const [i, file] of list.entries()) {
        setProgress(`Subiendo ${i + 1} de ${list.length}…`);
        try {
          const data = new FormData();
          data.append("file", await compressImage(file));
          const result = await uploadVehicleImage(vehicleId, data);
          if (result.error) failed.push(`${file.name}: ${result.error}`);
        } catch (e) {
          failed.push(`${file.name}: ${e instanceof Error ? e.message : "no se pudo subir"}`);
        }
      }
      setErrors(failed);
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  const run = (fn: () => Promise<void>) => startTransition(fn);

  return (
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Fotos</h2>
          <p className="text-xs text-slate-500">La primera foto es la portada. JPG, PNG o WebP. Se achican solas antes de subirse.</p>
        </div>
        <label className={`btn-dark cursor-pointer ${pending ? "pointer-events-none opacity-60" : ""}`}>
          {progress ?? "+ Subir fotos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={pending}
            onChange={(e) => upload(e.target.files)}
          />
        </label>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {images.length === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Todavía no hay fotos. Los autos con fotos reciben muchas más consultas.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="relative aspect-[4/3]">
                <Image src={img.url} alt={`Foto ${i + 1}`} fill sizes="240px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">Portada</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
                <div className="flex gap-1">
                  <IconButton label="Mover a la izquierda" disabled={pending || i === 0} onClick={() => run(() => moveVehicleImage(img.id, -1))}>←</IconButton>
                  <IconButton label="Mover a la derecha" disabled={pending || i === images.length - 1} onClick={() => run(() => moveVehicleImage(img.id, 1))}>→</IconButton>
                  {i !== 0 && (
                    <IconButton label="Usar como portada" disabled={pending} onClick={() => run(() => moveVehicleImage(img.id, "first"))}>★</IconButton>
                  )}
                </div>
                <IconButton
                  label="Eliminar foto"
                  disabled={pending}
                  danger
                  onClick={() => {
                    if (confirm("¿Eliminar esta foto?")) run(() => deleteVehicleImage(img.id));
                  }}
                >
                  ✕
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function IconButton({
  label,
  danger,
  children,
  ...props
}: { label: string; danger?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded border border-slate-200 disabled:opacity-30 ${
        danger ? "text-brand-600 hover:bg-brand-50" : "hover:bg-slate-100"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
