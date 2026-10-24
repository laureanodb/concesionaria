import Image from "next/image";
import Link from "next/link";
import { FUELS, TRANSMISSIONS, label } from "@/lib/constants";
import { formatKm, formatPrice, vehicleTitle } from "@/lib/format";
import type { VehicleCard as VehicleCardData } from "@/lib/vehicles";
import { CarPlaceholder } from "./CarPlaceholder";
import { ConditionBadge, StatusBadge } from "./StatusBadge";

export function VehicleCard({ vehicle }: { vehicle: VehicleCardData }) {
  return (
    <Link
      href={`/autos/${vehicle.slug}`}
      className="group card flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {vehicle.cover ? (
          <Image
            src={vehicle.cover}
            alt={vehicleTitle(vehicle)}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <CarPlaceholder className="h-full w-full" />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <ConditionBadge condition={vehicle.condition} />
          {vehicle.status === "RESERVADO" && <StatusBadge status={vehicle.status} />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug">
          {vehicle.brand} {vehicle.model}
          {vehicle.version && (
            <span className="block text-sm font-normal text-slate-500">{vehicle.version}</span>
          )}
        </h3>
        <p className="text-sm text-slate-500">
          {vehicle.year} · {formatKm(vehicle.km)} · {label(FUELS, vehicle.fuel)} ·{" "}
          {label(TRANSMISSIONS, vehicle.transmission)}
        </p>
        <p className="mt-auto pt-2 text-xl font-bold text-ink-900">
          {formatPrice(vehicle.price, vehicle.currency)}
        </p>
      </div>
    </Link>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="aspect-[4/3] bg-slate-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-6 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
