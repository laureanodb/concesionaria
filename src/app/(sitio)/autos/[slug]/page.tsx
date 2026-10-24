import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery } from "@/components/site/Gallery";
import { LeadForm } from "@/components/site/LeadForm";
import { ConditionBadge, StatusBadge } from "@/components/site/StatusBadge";
import { BODY_TYPES, CONTACT, FUELS, TRANSMISSIONS, label } from "@/lib/constants";
import { formatKm, formatPrice, vehicleTitle, whatsappLink } from "@/lib/format";
import { jsonLd, siteUrl } from "@/lib/site";
import { getPublicVehicle, type PublicVehicle } from "@/lib/vehicles";

export async function generateMetadata({ params }: PageProps<"/autos/[slug]">): Promise<Metadata> {
  const vehicle = await getPublicVehicle((await params).slug);
  if (!vehicle) return { title: "Vehículo no encontrado" };
  const title = `${vehicleTitle(vehicle)} ${vehicle.year}`;
  const description = `${title} · ${formatKm(vehicle.km)} · ${formatPrice(vehicle.price, vehicle.currency)}`;
  return {
    title,
    description,
    alternates: { canonical: `/autos/${vehicle.slug}` },
    openGraph: {
      title: `${title} · ${formatPrice(vehicle.price, vehicle.currency)}`,
      description: `${formatKm(vehicle.km)} · ${label(FUELS, vehicle.fuel)} · ${label(TRANSMISSIONS, vehicle.transmission)}`,
      url: `/autos/${vehicle.slug}`,
      images: vehicle.images[0] ? [{ url: vehicle.images[0].url, alt: title }] : [],
    },
  };
}

export default function VehiclePage({ params }: PageProps<"/autos/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/autos" className="mb-4 inline-block text-sm text-slate-600 hover:text-brand-600">
        ← Volver al catálogo
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <VehicleDetail params={params} />
      </Suspense>
    </div>
  );
}

async function VehicleDetail({ params }: Pick<PageProps<"/autos/[slug]">, "params">) {
  const vehicle = await getPublicVehicle((await params).slug);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const sold = vehicle.status === "VENDIDO";
  const message = `Hola, me interesa el ${title} ${vehicle.year} (${formatPrice(vehicle.price, vehicle.currency)}). ¿Sigue disponible?`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(vehicleJsonLd(vehicle))} />
      <div className="space-y-8">
        <Gallery images={vehicle.images} alt={title} />
        {vehicle.description && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">Descripción</h2>
            <p className="whitespace-pre-line text-slate-700">{vehicle.description}</p>
          </section>
        )}
        <Specs vehicle={vehicle} />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <ConditionBadge condition={vehicle.condition} />
            {vehicle.status !== "DISPONIBLE" && <StatusBadge status={vehicle.status} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {vehicle.brand} {vehicle.model}
            </h1>
            {vehicle.version && <p className="text-slate-600">{vehicle.version}</p>}
            <p className="mt-1 text-sm text-slate-500">
              {vehicle.year} · {formatKm(vehicle.km)}
            </p>
          </div>
          <p className="text-3xl font-extrabold">{formatPrice(vehicle.price, vehicle.currency)}</p>
          {sold ? (
            <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
              Esta unidad ya fue vendida. <Link href="/autos" className="font-semibold text-brand-600">Mirá otras opciones</Link>.
            </p>
          ) : (
            <a href={whatsappLink(CONTACT.whatsapp, message)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full py-3 text-base">
              Consultar por WhatsApp
            </a>
          )}
          <a href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`} className="btn-outline w-full">
            Llamar: {CONTACT.phone}
          </a>
          <p className="text-xs text-slate-500">
            Aceptamos tu usado como parte de pago. Consultá por planes de financiación.
          </p>
        </div>
        {!sold && (
          <div className="card mt-4 p-5">
            <h2 className="mb-3 font-semibold">¿Te interesa? Dejanos tus datos</h2>
            <LeadForm vehicleId={vehicle.id} defaultMessage={`Hola, me interesa el ${title} ${vehicle.year}.`} />
          </div>
        )}
      </aside>
    </div>
  );
}

function Specs({ vehicle }: { vehicle: PublicVehicle }) {
  const specs: [string, string | number | null | undefined][] = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Versión", vehicle.version],
    ["Año", vehicle.year],
    ["Kilómetros", formatKm(vehicle.km)],
    ["Combustible", label(FUELS, vehicle.fuel)],
    ["Transmisión", label(TRANSMISSIONS, vehicle.transmission)],
    ["Tipo", label(BODY_TYPES, vehicle.bodyType)],
    ["Color", vehicle.color],
    ["Puertas", vehicle.doors],
  ];
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Características</h2>
      <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-3">
        {specs
          .filter(([, value]) => value !== null && value !== undefined && value !== "")
          .map(([name, value]) => (
            <div key={name} className="border-b border-slate-100 p-3">
              <dt className="text-xs text-slate-500">{name}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_380px]">
      <div className="aspect-[4/3] rounded-xl bg-slate-200" />
      <div className="card h-80 bg-slate-50" />
    </div>
  );
}

function vehicleJsonLd(vehicle: PublicVehicle) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${vehicleTitle(vehicle)} ${vehicle.year}`,
    brand: { "@type": "Brand", name: vehicle.brand },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.km, unitCode: "KMT" },
    fuelType: label(FUELS, vehicle.fuel),
    vehicleTransmission: label(TRANSMISSIONS, vehicle.transmission),
    bodyType: label(BODY_TYPES, vehicle.bodyType),
    ...(vehicle.color && { color: vehicle.color }),
    ...(vehicle.doors && { numberOfDoors: vehicle.doors }),
    itemCondition: vehicle.condition === "NUEVO" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    image: vehicle.images.map((img) => (img.url.startsWith("http") ? img.url : `${base}${img.url}`)),
    url: `${base}/autos/${vehicle.slug}`,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: vehicle.currency,
      availability: vehicle.status === "VENDIDO" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: "Automotores Laureano" },
    },
  };
}
