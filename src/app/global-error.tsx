"use client";

import { useEffect } from "react";
import "./globals.css";

// Solo aparece si falla el diseño general del sitio; por eso define su propio <html>.
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es-AR">
      <body className="flex min-h-screen items-center justify-center px-4">
        <title>Error | Automotores Laureano</title>
        <main className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Automotores Laureano</h1>
          <p className="text-slate-600">El sitio tuvo un problema. Probá de nuevo en unos segundos.</p>
          <button type="button" onClick={() => retry()} className="btn-primary">Reintentar</button>
        </main>
      </body>
    </html>
  );
}
