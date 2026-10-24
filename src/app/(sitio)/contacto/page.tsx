import type { Metadata } from "next";
import { LeadForm } from "@/components/site/LeadForm";
import { CONTACT } from "@/lib/constants";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribinos o visitanos en Automotores Laureano.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="space-y-5">
        <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
        <p className="text-slate-600">
          ¿Buscás un auto en particular, querés vender el tuyo o consultar por financiación? Dejanos tu
          mensaje y te respondemos a la brevedad.
        </p>
        <dl className="space-y-3 text-sm">
          <div><dt className="font-semibold">Dirección</dt><dd className="text-slate-600">{CONTACT.address}</dd></div>
          <div><dt className="font-semibold">Teléfono</dt><dd className="text-slate-600">{CONTACT.phone}</dd></div>
          <div><dt className="font-semibold">Email</dt><dd className="text-slate-600">{CONTACT.email}</dd></div>
          <div><dt className="font-semibold">Horarios</dt><dd className="text-slate-600">{CONTACT.hours}</dd></div>
        </dl>
        <a href={whatsappLink(CONTACT.whatsapp, "Hola, quería hacer una consulta.")} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
          Escribinos por WhatsApp
        </a>
      </div>
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">Envianos tu consulta</h2>
        <LeadForm />
      </div>
    </div>
  );
}
