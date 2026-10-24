"use client";

import { useActionState, useState } from "react";
import { resetUserPassword, type ResetPasswordState } from "@/app/admin/actions/users";

export function ResetPasswordForm({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetUserPassword.bind(null, userId), {});

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="font-semibold text-slate-600 hover:underline">
        Cambiar contraseña
      </button>
    );
  }
  return (
    <form action={action} className="flex flex-wrap items-start justify-end gap-2">
      <div>
        <label htmlFor={`pw-${userId}`} className="sr-only">Nueva contraseña para {userName}</label>
        <input id={`pw-${userId}`} name="password" type="password" autoComplete="new-password" placeholder="Nueva (mín. 8)" required className="input w-40 py-1" />
        {state.error && <p className="mt-1 text-left text-xs text-brand-600">{state.error}</p>}
        {state.ok && <p className="mt-1 text-left text-xs text-emerald-700">Contraseña cambiada</p>}
      </div>
      <button disabled={pending} className="btn-primary py-1">{pending ? "…" : "Guardar"}</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-outline py-1">Cerrar</button>
    </form>
  );
}
