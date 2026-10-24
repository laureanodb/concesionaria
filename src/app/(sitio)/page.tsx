import Link from "next/link";
import { VehicleCard } from "@/components/site/VehicleCard";
import { BODY_TYPES } from "@/lib/constants";
import { getFeaturedVehicles } from "@/lib/vehicles";

const BENEFITS = [
  { title: "Financiación", text: "Planes a tu medida con las principales entidades." },
  { title: "Tomamos tu usado", text: "Cotizamos tu auto y lo usás como parte de pago." },
  { title: "Usados revisados", text: "Cada unidad pasa por una revisión mecánica completa." },
  { title: "Gestoría incluida", text: "Nos encargamos de la transferencia y los papeles." },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-ink-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:py-24">
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-semibold tracking-[0.2em] text-brand-500 uppercase">
              Automotores Laureano
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Tu próximo auto te está esperando
            </h1>
            <p className="text-lg text-slate-300">
              0 km y usados seleccionados, con financiación y la confianza de siempre.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/autos" className="btn-primary px-6 py-3 text-base">
                Ver catálogo
              </Link>
              <Link href="/contacto" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
                Contactanos
              </Link>
            </div>
          </div>
          <form action="/autos" className="flex max-w-2xl flex-col gap-2 rounded-xl bg-white p-2 sm:flex-row">
            <label htmlFor="hero-q" className="sr-only">Buscar por marca o modelo</label>
            <input id="hero-q" name="q" placeholder="Buscá por marca o modelo (ej: Corolla)" className="input border-0 focus:ring-0" />
            <button className="btn-primary shrink-0">Buscar</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Destacados</h2>
          <Link href="/autos" className="text-sm font-semibold text-brand-600 hover:underline">
            Ver todos →
          </Link>
        </div>
        <FeaturedVehicles />
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">Buscá por tipo</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(BODY_TYPES).map(([key, name]) => (
              <Link key={key} href={`/autos?carroceria=${key}`} className="btn-outline">
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card p-5">
            <h3 className="mb-1 font-semibold">{b.title}</h3>
            <p className="text-sm text-slate-600">{b.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}

async function FeaturedVehicles() {
  const vehicles = await getFeaturedVehicles();
  if (vehicles.length === 0) {
    return <p className="text-slate-500">Muy pronto vas a ver nuestras unidades acá.</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
