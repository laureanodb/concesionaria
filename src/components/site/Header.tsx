import Link from "next/link";
import { CONTACT } from "@/lib/constants";
import { whatsappLink } from "@/lib/format";
import { Logo } from "./Logo";

const NAV = [
  { href: "/autos", label: "Catálogo" },
  { href: "/autos?condicion=NUEVO", label: "0 km" },
  { href: "/autos?condicion=USADO", label: "Usados" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={whatsappLink(CONTACT.whatsapp, "Hola, quería hacer una consulta.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp px-3 py-2"
        >
          WhatsApp
        </a>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-700 md:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 hover:text-brand-600">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
