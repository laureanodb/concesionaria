"use client";

import { useActionState } from "react";
import { createFirstAdmin, type SetupState } from "../actions/auth";

export function SetupForm() {
  const [state, action, pending] = useActionState<SetupState, FormData>(createFirstAdmin, {});
  const e = state.errors ?? {};
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Todavía no hay usuarios. Creá la cuenta del administrador principal.
      </p>
      {([
        ["name", "Nombre", "text", "name"],
        ["email", "Email", "email", "username"],
        ["password", "Contraseña (mín. 8)", "password", "new-password"],
      ] as const).map(([name, label, type, autoComplete]) => (
        <div key={name}>
          <label htmlFor={`setup-${name}`} className="field-label">{label}</label>
          <input id={`setup-${name}`} name={name} type={type} autoComplete={autoComplete} defaultValue={name === "password" ? undefined : v[name]} required className="input" />
          {e[name] && <p className="mt-1 text-xs text-brand-600">{e[name]}</p>}
        </div>
      ))}
      <button disabled={pending} className="btn-primary w-full">{pending ? "Creando…" : "Crear administrador"}</button>
    </form>
  );
}
