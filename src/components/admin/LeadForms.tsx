"use client";

import { useActionState } from "react";
import { createLead, updateLead, type AdminLeadState, type LeadUpdateState } from "@/app/admin/actions/leads";
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TYPES } from "@/lib/constants";
import { FormMessage, SelectField, TextAreaField, TextField } from "./FormFields";

type Option = [string, string];

export function NewLeadForm({
  vehicles,
  users,
  defaultVehicleId,
  currentUserId,
}: {
  vehicles: Option[];
  users: Option[];
  defaultVehicleId?: string;
  currentUserId: string;
}) {
  const [state, action, pending] = useActionState<AdminLeadState, FormData>(createLead, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  return (
    <form key={JSON.stringify(v)} action={action} className="card grid gap-4 p-5 sm:grid-cols-2" noValidate>
      <SelectField name="type" label="Tipo" options={LEAD_TYPES} defaultValue={v.type ?? "CONSULTA"} />
      <SelectField name="source" label="Origen" options={LEAD_SOURCES} defaultValue={v.source ?? "TELEFONO"} />
      <TextField name="name" label="Nombre *" defaultValue={v.name} error={e.name} />
      <TextField name="phone" label="Teléfono *" type="tel" defaultValue={v.phone} error={e.phone} />
      <TextField name="email" label="Email" type="email" defaultValue={v.email} error={e.email} />
      <SelectField name="vehicleId" label="Vehículo de interés" options={vehicles} emptyLabel="— Ninguno en particular —" defaultValue={v.vehicleId ?? defaultVehicleId ?? ""} />
      <TextField name="preferredDate" label="Día/horario (test drive)" defaultValue={v.preferredDate} error={e.preferredDate} />
      <SelectField name="assignedToId" label="Asignada a" options={users} defaultValue={v.assignedToId ?? currentUserId} />
      <div className="sm:col-span-2">
        <TextAreaField name="message" label="Detalle de la consulta" defaultValue={v.message} error={e.message} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : "Guardar consulta"}</button>
        <FormMessage message={state.errors ? "Revisá los campos marcados" : undefined} isError />
      </div>
    </form>
  );
}

export function LeadUpdateForm({
  leadId,
  users,
  defaults,
}: {
  leadId: string;
  users: Option[];
  defaults: { status: string; assignedToId: string; notes: string };
}) {
  const [state, action, pending] = useActionState<LeadUpdateState, FormData>(updateLead.bind(null, leadId), {});
  return (
    // La key vuelve a montar el formulario con los datos guardados (si no, React lo reinicia a los valores viejos).
    <form key={JSON.stringify(defaults)} action={action} className="card space-y-4 p-5">
      <h2 className="font-semibold">Seguimiento</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="status" label="Estado" options={LEAD_STATUSES} defaultValue={defaults.status} />
        <SelectField name="assignedToId" label="Asignada a" options={users} emptyLabel="— Sin asignar —" defaultValue={defaults.assignedToId} />
      </div>
      <TextAreaField name="notes" label="Notas internas" rows={4} defaultValue={defaults.notes} error={state.errors?.notes} placeholder="Ej: lo llamé el martes, quiere ver el auto el sábado." />
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : "Guardar"}</button>
        <FormMessage message={state.message} />
      </div>
    </form>
  );
}
