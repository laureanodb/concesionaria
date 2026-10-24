"use client";

import { startTransition, useActionState, useState } from "react";
import { createSale, type SaleFormState } from "@/app/admin/actions/sales";
import { CURRENCIES, PAYMENT_METHODS } from "@/lib/constants";
import { FormMessage, SelectField, TextAreaField, TextField } from "./FormFields";

export type SaleVehicleOption = { id: string; label: string; price: number; currency: string };

export function SaleForm({
  vehicles,
  customers,
  defaults,
}: {
  vehicles: SaleVehicleOption[];
  customers: [string, string][];
  defaults: { vehicleId: string; customerId: string; date: string };
}) {
  const [state, action, pending] = useActionState<SaleFormState, FormData>(createSale, {});
  const v: Record<string, string> = state.values ?? {};
  const e = state.errors ?? {};

  const [vehicleId, setVehicleId] = useState(v.vehicleId ?? defaults.vehicleId);
  const [customerId, setCustomerId] = useState(v.customerId ?? defaults.customerId);
  const selected = vehicles.find((x) => x.id === vehicleId);
  const [price, setPrice] = useState(v.price ?? (selected ? String(selected.price) : ""));
  const [currency, setCurrency] = useState(v.currency ?? selected?.currency ?? "USD");

  function chooseVehicle(id: string) {
    setVehicleId(id);
    const next = vehicles.find((x) => x.id === id);
    if (next) {
      setPrice(String(next.price));
      setCurrency(next.currency);
    }
  }

  return (
    <form
      // Se envía a mano para que React no reinicie el formulario: así, si hay un error,
      // no se pierden el vehículo ni el cliente elegidos.
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-6"
      noValidate
    >
      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="sr-only">Operación</legend>
        <div className="sm:col-span-2">
          <SelectField
            name="vehicleId"
            label="Vehículo *"
            options={vehicles.map((x) => [x.id, x.label] as [string, string])}
            emptyLabel="— Elegí el vehículo —"
            value={vehicleId}
            onChange={(ev) => chooseVehicle(ev.target.value)}
            error={e.vehicleId}
          />
        </div>
        <TextField name="date" label="Fecha *" type="date" defaultValue={v.date ?? defaults.date} error={e.date} />
        <div>
          <label htmlFor="price" className="field-label">Precio final *</label>
          <div className="flex gap-2">
            <select name="currency" value={currency} onChange={(ev) => setCurrency(ev.target.value)} className="input w-24" aria-label="Moneda">
              {Object.entries(CURRENCIES).map(([k, s]) => (
                <option key={k} value={k}>{s}</option>
              ))}
            </select>
            <input id="price" name="price" inputMode="numeric" value={price} onChange={(ev) => setPrice(ev.target.value)} className="input" aria-invalid={!!e.price} />
          </div>
          {e.price && <p className="mt-1 text-xs text-brand-600">{e.price}</p>}
        </div>
        <SelectField name="paymentMethod" label="Forma de pago" options={PAYMENT_METHODS} defaultValue={v.paymentMethod ?? "CONTADO"} />
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="sr-only">Cliente</legend>
        <div className="sm:col-span-2">
          <SelectField
            name="customerId"
            label="Cliente *"
            options={customers}
            emptyLabel="+ Cliente nuevo"
            value={customerId}
            onChange={(ev) => setCustomerId(ev.target.value)}
          />
        </div>
        {!customerId && (
          <>
            <TextField name="customerName" label="Nombre y apellido *" defaultValue={v.customerName} error={e.customerName} />
            <TextField name="customerPhone" label="Teléfono" type="tel" defaultValue={v.customerPhone} error={e.customerPhone} />
            <TextField name="customerEmail" label="Email" type="email" defaultValue={v.customerEmail} error={e.customerEmail} />
            <TextField name="customerDni" label="DNI / CUIT" defaultValue={v.customerDni} error={e.customerDni} />
          </>
        )}
      </fieldset>

      <fieldset className="card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="sr-only">Usado y notas</legend>
        <TextField name="tradeIn" label="Usado recibido (opcional)" placeholder="Ej: VW Gol 2015, 120.000 km" defaultValue={v.tradeIn} error={e.tradeIn} />
        <TextField name="tradeInValue" label={`Valor del usado (${CURRENCIES[currency as keyof typeof CURRENCIES] ?? currency})`} inputMode="numeric" defaultValue={v.tradeInValue} error={e.tradeInValue} />
        <div className="sm:col-span-2">
          <TextAreaField name="notes" label="Notas" defaultValue={v.notes} error={e.notes} placeholder="Ej: entrega con service hecho, financiado en 24 cuotas…" />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn-primary px-6">{pending ? "Registrando…" : "Registrar venta"}</button>
        <FormMessage message={state.message} isError />
        <p className="text-xs text-slate-500">Al registrarla, el vehículo pasa a “Vendido” y deja de verse en la web.</p>
      </div>
    </form>
  );
}
