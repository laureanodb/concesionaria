"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className="input" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-brand-50 p-2 text-sm text-brand-700">{state.error}</p>
      )}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
