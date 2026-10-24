import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/site/Logo";
import { requireUser } from "@/lib/auth";
import { ROLES, label } from "@/lib/constants";
import { logout } from "../actions/auth";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel Automotores Laureano" },
  robots: { index: false },
};

// El panel siempre muestra datos al momento y depende de la sesión.
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col bg-slate-100 md:flex-row">
      <aside className="flex flex-col gap-6 bg-ink-900 p-4 text-slate-200 md:w-60 md:shrink-0">
        <Logo light />
        <Suspense fallback={<div className="h-40" />}>
          <PanelNav />
        </Suspense>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}

async function PanelNav() {
  const user = await requireUser();
  const items = [
    { href: "/admin", label: "Resumen" },
    { href: "/admin/vehiculos", label: "Stock" },
    { href: "/admin/vehiculos/nuevo", label: "Cargar vehículo" },
    ...(user.role === "ADMIN" ? [{ href: "/admin/usuarios", label: "Usuarios" }] : []),
  ];
  return (
    <>
      <nav className="flex flex-wrap gap-1 text-sm md:flex-col">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-ink-700">
            {item.label}
          </Link>
        ))}
        <a href="/" target="_blank" className="rounded-lg px-3 py-2 hover:bg-ink-700">
          Ver la web ↗
        </a>
      </nav>
      <div className="mt-auto space-y-2 border-t border-ink-700 pt-4 text-sm">
        <p className="font-medium text-white">{user.name}</p>
        <p className="text-xs text-slate-400">{label(ROLES, user.role)}</p>
        <form action={logout}>
          <button className="text-xs text-slate-300 underline hover:text-white">Cerrar sesión</button>
        </form>
      </div>
    </>
  );
}
