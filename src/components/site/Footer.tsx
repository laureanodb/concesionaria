import Link from "next/link";
import { CONTACT, SITE_NAME } from "@/lib/constants";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contacto" className="mt-auto bg-ink-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm">Autos 0 km y usados seleccionados. Financiación y tomamos tu usado.</p>
        </div>
        <div className="space-y-2 text-sm">
          <h2 className="font-semibold text-white">Contacto</h2>
          <p>{CONTACT.address}</p>
          <p>Tel: {CONTACT.phone}</p>
          <p>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
              {CONTACT.email}
            </a>
          </p>
          <p>{CONTACT.hours}</p>
        </div>
        <div className="space-y-2 text-sm">
          <h2 className="font-semibold text-white">Navegación</h2>
          <ul className="space-y-1">
            <li><Link href="/autos" className="hover:text-white">Catálogo completo</Link></li>
            <li><Link href="/autos?condicion=NUEVO" className="hover:text-white">0 km</Link></li>
            <li><Link href="/autos?condicion=USADO" className="hover:text-white">Usados</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700 py-4 text-center text-xs text-slate-400">
        © {SITE_NAME}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
