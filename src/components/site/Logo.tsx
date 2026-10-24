import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Automotores Laureano - Inicio">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-lg font-black text-white">
        AL
      </span>
      <span className={`leading-tight ${light ? "text-white" : "text-ink-900"}`}>
        <span className="block text-xs font-medium tracking-[0.2em] uppercase opacity-70">
          Automotores
        </span>
        <span className="block text-lg font-extrabold tracking-tight">Laureano</span>
      </span>
    </Link>
  );
}
