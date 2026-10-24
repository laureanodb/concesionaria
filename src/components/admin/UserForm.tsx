"use client";

import { useActionState } from "react";
import { createUser, type UserFormState } from "@/app/admin/actions/users";
import { ROLES } from "@/lib/constants";

export function UserForm() {
  const [state, action, pending] = useActionState<UserFormState, FormData>(createUser, {});
  const e = state.errors ?? {};
  return (
    <form key={state.ok ? state.message : "form"} action={action} className="card grid gap-4 p-5 sm:grid-cols-2">
      <h2 className="font-semibold sm:col-span-2">Nuevo usuario</h2>
      <Input name="name" label="Nombre" error={e.name} />
      <Input name="email" label="Email" type="email" error={e.email} />
      <Input name="password" label="Contraseña (mín. 8)" type="password" error={e.password} autoComplete="new-password" />
      <div>
        <label htmlFor="role" className="field-label">Rol</label>
        <select id="role" name="role" defaultValue="VENDEDOR" className="input">
          {Object.entries(ROLES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-primary">{pending ? "Creando…" : "Crear usuario"}</button>
        {state.message && <p role="status" className="text-sm text-emerald-700">{state.message}</p>}
      </div>
    </form>
  );
}

function Input({ name, label, error, ...props }: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} required className="input" aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}
