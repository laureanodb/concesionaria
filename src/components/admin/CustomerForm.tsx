"use client";

import { useActionState } from "react";
import { saveCustomer, type CustomerFormState } from "@/app/admin/actions/customers";
import { FormMessage, TextAreaField, TextField } from "./FormFields";

export type CustomerDefaults = { name: string; phone: string; email: string; dni: string; address: string; notes: string };

export function CustomerForm({ customerId, defaults }: { customerId: string | null; defaults: CustomerDefaults }) {
  const [state, action, pending] = useActionState<CustomerFormState, FormData>(saveCustomer.bind(null, customerId), {});
  const v = { ...defaults, ...state.values };
  const e = state.errors ?? {};
  return (
    <form key={JSON.stringify(state.values ?? defaults)} action={action} className="card grid gap-4 p-5 sm:grid-cols-2" noValidate>
      <TextField name="name" label="Nombre y apellido *" defaultValue={v.name} error={e.name} />
      <TextField name="phone" label="Teléfono" type="tel" defaultValue={v.phone} error={e.phone} />
      <TextField name="email" label="Email" type="email" defaultValue={v.email} error={e.email} />
      <TextField name="dni" label="DNI / CUIT" defaultValue={v.dni} error={e.dni} />
      <div className="sm:col-span-2">
        <TextField name="address" label="Domicilio" defaultValue={v.address} error={e.address} />
      </div>
      <div className="sm:col-span-2">
        <TextAreaField name="notes" label="Notas" defaultValue={v.notes} error={e.notes} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-primary">
          {pending ? "Guardando…" : customerId ? "Guardar cambios" : "Crear cliente"}
        </button>
        <FormMessage message={state.message} isError={!!state.errors} />
      </div>
    </form>
  );
}
