"use client";

import { useActionState } from "react";
import { saveVehicle, type VehicleFormState } from "@/app/admin/actions/vehicles";
import { BODY_TYPES, CONDITIONS, CURRENCIES, FUELS, STATUSES, TRANSMISSIONS } from "@/lib/constants";

export type VehicleFormDefaults = {
  brand: string;
  model: string;
  version: string;
  year: string;
  km: string;
  price: string;
  currency: string;
  condition: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  doors: string;
  description: string;
  status: string;
  published: boolean;
  featured: boolean;
};

export const EMPTY_VEHICLE: VehicleFormDefaults = {
  brand: "", model: "", version: "", year: "", km: "0", price: "", currency: "USD",
  condition: "USADO", fuel: "NAFTA", transmission: "MANUAL", bodyType: "SEDAN",
  color: "", doors: "", description: "", status: "DISPONIBLE", published: true, featured: false,
};

export function VehicleForm({ vehicleId, defaults }: { vehicleId: string | null; defaults: VehicleFormDefaults }) {
  const [state, action, pending] = useActionState<VehicleFormState, FormData>(
    saveVehicle.bind(null, vehicleId),
    {},
  );
  // Si hubo errores se muestran los valores que cargó el usuario y no los originales.
  const v = { ...defaults, ...(state.values as Partial<VehicleFormDefaults> | undefined) };
  const e = state.errors ?? {};
  const formKey = JSON.stringify(state.values ?? defaults);

  return (
    <form key={formKey} action={action} className="space-y-6" noValidate>
      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">Datos del vehículo</legend>
        <Field name="brand" label="Marca *" defaultValue={v.brand} error={e.brand} placeholder="Toyota" />
        <Field name="model" label="Modelo *" defaultValue={v.model} error={e.model} placeholder="Corolla" />
        <Field name="version" label="Versión" defaultValue={v.version} error={e.version} placeholder="2.0 XEI CVT" />
        <Field name="year" label="Año *" defaultValue={v.year} error={e.year} inputMode="numeric" />
        <Field name="km" label="Kilómetros *" defaultValue={v.km} error={e.km} inputMode="numeric" />
        <div>
          <label htmlFor="price" className="field-label">Precio *</label>
          <div className="flex gap-2">
            <select name="currency" defaultValue={v.currency} className="input w-24" aria-label="Moneda">
              {Object.entries(CURRENCIES).map(([k, s]) => (
                <option key={k} value={k}>{s}</option>
              ))}
            </select>
            <input id="price" name="price" defaultValue={v.price} inputMode="numeric" className="input" aria-invalid={!!e.price} />
          </div>
          {e.price && <p className="mt-1 text-xs text-brand-600">{e.price}</p>}
        </div>
        <Choice name="condition" label="Condición" defaultValue={v.condition} options={CONDITIONS} />
        <Choice name="bodyType" label="Tipo" defaultValue={v.bodyType} options={BODY_TYPES} />
        <Choice name="fuel" label="Combustible" defaultValue={v.fuel} options={FUELS} />
        <Choice name="transmission" label="Transmisión" defaultValue={v.transmission} options={TRANSMISSIONS} />
        <Field name="color" label="Color" defaultValue={v.color} error={e.color} />
        <div>
          <label htmlFor="doors" className="field-label">Puertas</label>
          <select id="doors" name="doors" defaultValue={v.doors} className="input">
            <option value="">—</option>
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="description" className="field-label">Descripción</label>
          <textarea id="description" name="description" rows={5} defaultValue={v.description} className="input" placeholder="Único dueño, service oficiales, cubiertas nuevas…" />
          {e.description && <p className="mt-1 text-xs text-brand-600">{e.description}</p>}
        </div>
      </fieldset>

      <fieldset className="card flex flex-wrap items-center gap-6 p-5">
        <legend className="sr-only">Publicación</legend>
        <Choice name="status" label="Estado" defaultValue={v.status} options={STATUSES} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={v.published} className="h-4 w-4 accent-brand-600" />
          Publicado en la web
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={v.featured} className="h-4 w-4 accent-brand-600" />
          Destacado en la portada
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn-primary px-6">
          {pending ? "Guardando…" : vehicleId ? "Guardar cambios" : "Crear y cargar fotos"}
        </button>
        {state.message && (
          <p role="status" className={`text-sm ${state.errors ? "text-brand-600" : "text-emerald-700"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  ...props
}: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} className="input" aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}

function Choice({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Record<string, string>;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <select id={name} name={name} defaultValue={defaultValue} className="input">
        {Object.entries(options).map(([k, text]) => (
          <option key={k} value={k}>{text}</option>
        ))}
      </select>
    </div>
  );
}
