import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-5xl font-black text-brand-600">404</p>
      <h1 className="text-2xl font-bold">No encontramos lo que buscabas</h1>
      <p className="text-slate-600">Puede que el vehículo ya no esté publicado.</p>
      <Link href="/autos" className="btn-primary">Ver catálogo</Link>
    </main>
  );
}
