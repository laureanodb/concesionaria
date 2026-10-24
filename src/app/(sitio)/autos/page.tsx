import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { VehicleCard, VehicleGridSkeleton } from "@/components/site/VehicleCard";
import { BODY_TYPES, CONDITIONS, FUELS, TRANSMISSIONS } from "@/lib/constants";
import { hasActiveFilters, parseFilters, type VehicleFilters } from "@/lib/filters";
import { getBrands, searchVehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Catálogo de autos",
  description: "Autos 0 km y usados disponibles en Automotores Laureano.",
};

export default function CatalogPage({ searchParams }: PageProps<"/autos">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Catálogo</h1>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <Suspense fallback={<div className="card h-96 animate-pulse bg-slate-50" />}>
            <Filters searchParams={searchParams} />
          </Suspense>
        </aside>
        <section>
          <Suspense fallback={<VehicleGridSkeleton />}>
            <Results searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

type SearchParamsProp = Pick<PageProps<"/autos">, "searchParams">;

async function Results({ searchParams }: SearchParamsProp) {
  const filters = parseFilters(await searchParams);
  const vehicles = await searchVehicles(filters);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-slate-600">
        <p>
          {vehicles.length === 1 ? "1 vehículo encontrado" : `${vehicles.length} vehículos encontrados`}
        </p>
        {hasActiveFilters(filters) && (
          <Link href="/autos" className="font-semibold text-brand-600 hover:underline">
            Limpiar filtros
          </Link>
        )}
      </div>
      {vehicles.length === 0 ? (
        <div className="card p-10 text-center text-slate-600">
          No encontramos vehículos con esos filtros. Probá con otra búsqueda o escribinos y te
          ayudamos a encontrarlo.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}
    </>
  );
}

async function Filters({ searchParams }: SearchParamsProp) {
  const [filters, brands] = await Promise.all([searchParams.then(parseFilters), getBrands()]);
  // La key reinicia el formulario cuando cambian los filtros desde un link.
  const key = JSON.stringify(filters);
  return <FiltersForm key={key} filters={filters} brands={brands} />;
}

function FiltersForm({ filters, brands }: { filters: VehicleFilters; brands: string[] }) {
  return (
    <Form action="/autos" className="card space-y-4 p-4">
      <div>
        <label htmlFor="q" className="field-label">Buscar</label>
        <input id="q" name="q" defaultValue={filters.q} placeholder="Marca o modelo" className="input" />
      </div>
      <Select name="condicion" label="Condición" value={filters.condicion} options={CONDITIONS} />
      <Select
        name="marca"
        label="Marca"
        value={filters.marca}
        options={Object.fromEntries(brands.map((b) => [b, b]))}
      />
      <Select name="carroceria" label="Tipo" value={filters.carroceria} options={BODY_TYPES} />
      <Select name="combustible" label="Combustible" value={filters.combustible} options={FUELS} />
      <Select name="transmision" label="Transmisión" value={filters.transmision} options={TRANSMISSIONS} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="anioMin" className="field-label">Año desde</label>
          <input id="anioMin" name="anioMin" type="number" inputMode="numeric" defaultValue={filters.anioMin} className="input" />
        </div>
        <div>
          <label htmlFor="kmMax" className="field-label">Km hasta</label>
          <input id="kmMax" name="kmMax" type="number" inputMode="numeric" defaultValue={filters.kmMax} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="precioMax" className="field-label">Precio hasta</label>
        <div className="flex gap-2">
          <select name="moneda" defaultValue={filters.moneda ?? "USD"} className="input w-24" aria-label="Moneda">
            <option value="USD">US$</option>
            <option value="ARS">$</option>
          </select>
          <input id="precioMax" name="precioMax" type="number" inputMode="numeric" defaultValue={filters.precioMax} className="input" />
        </div>
      </div>
      <Select
        name="orden"
        label="Ordenar por"
        value={filters.orden}
        allowEmpty={false}
        options={{
          recientes: "Más recientes",
          "precio-asc": "Menor precio",
          "precio-desc": "Mayor precio",
          "km-asc": "Menos kilómetros",
          "anio-desc": "Más nuevos",
        }}
      />
      <button className="btn-primary w-full">Aplicar filtros</button>
    </Form>
  );
}

function Select({
  name,
  label,
  value,
  options,
  allowEmpty = true,
}: {
  name: string;
  label: string;
  value?: string;
  options: Record<string, string>;
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <select id={name} name={name} defaultValue={value ?? ""} className="input">
        {allowEmpty && <option value="">Todos</option>}
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}
