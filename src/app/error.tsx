"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CONTACT } from "@/lib/constants";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl font-black text-brand-600">Ups</p>
      <h1 className="text-2xl font-bold">Algo no anduvo bien</h1>
      <p className="text-slate-600">
        Tuvimos un problema al cargar esta página. Probá de nuevo en unos segundos. Si sigue pasando,
        escribinos al WhatsApp o llamanos al {CONTACT.phone}.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn-primary">Reintentar</button>
        <Link href="/" className="btn-outline">Ir al inicio</Link>
      </div>
    </main>
  );
}
