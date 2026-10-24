"use client";

import { useActionState, useState } from "react";
import { submitLead, type LeadFormState } from "@/app/actions/leads";

export function LeadForm({ vehicleId, defaultMessage = "" }: { vehicleId?: string; defaultMessage?: string }) {
  const [state, action, pending] = useActionState<LeadFormState, FormData>(submitLead, {});
  const [type, setType] = useState<"CONSULTA" | "TEST_DRIVE">("CONSULTA");
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3" noValidate>
      {vehicleId && (
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium" role="radiogroup" aria-label="Tipo de consulta">
          {(["CONSULTA", "TEST_DRIVE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => setType(t)}
              className={`rounded-md py-1.5 ${type === t ? "bg-white shadow-sm" : "text-slate-600"}`}
            >
              {t === "CONSULTA" ? "Consulta" : "Pedir test drive"}
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="vehicleId" value={vehicleId ?? ""} />
      <div className="hidden" aria-hidden="true">
        <label>No completar <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <Field name="name" label="Nombre" defaultValue={v.name} error={e.name} autoComplete="name" />
      <Field name="phone" label="Teléfono / WhatsApp" defaultValue={v.phone} error={e.phone} type="tel" autoComplete="tel" />
      <Field name="email" label="Email (opcional)" defaultValue={v.email} error={e.email} type="email" autoComplete="email" />
      {type === "TEST_DRIVE" && (
        <Field name="preferredDate" label="¿Qué día y horario te queda bien?" defaultValue={v.preferredDate} error={e.preferredDate} placeholder="Ej: sábado a la mañana" />
      )}
      <div>
        <label htmlFor="lead-message" className="field-label">Mensaje</label>
        <textarea id="lead-message" name="message" rows={3} defaultValue={v.message ?? defaultMessage} className="input" />
        {e.message && <p className="mt-1 text-xs text-brand-600">{e.message}</p>}
      </div>
      {state.message && <p role="alert" className="text-sm text-brand-700">{state.message}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Enviando…" : type === "TEST_DRIVE" ? "Pedir test drive" : "Enviar consulta"}
      </button>
    </form>
  );
}

function Field({ name, label, error, ...props }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `lead-${name}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <input id={id} name={name} className="input" aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}
