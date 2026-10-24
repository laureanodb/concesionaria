"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { STATUSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import { deleteImage, saveImage } from "@/lib/storage";
import { VEHICLES_TAG } from "@/lib/vehicles";
import { fieldErrors, vehicleFormValues, vehicleSchema } from "@/lib/validation";

export type VehicleFormState = {
  errors?: Record<string, string>;
  message?: string;
  values?: Record<string, unknown>;
};

/** Refresca la web pública (caché) y la pantalla actual del panel. */
function stockChanged() {
  updateTag(VEHICLES_TAG);
  refresh();
}

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "vehiculo";
  let slug = root;
  for (let i = 2; ; i++) {
    const existing = await db.vehicle.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function saveVehicle(
  vehicleId: string | null,
  _prev: VehicleFormState,
  formData: FormData,
): Promise<VehicleFormState> {
  await requireUser();

  const values = vehicleFormValues(formData);
  const parsed = vehicleSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: "Revisá los campos marcados", values };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(`${data.brand} ${data.model} ${data.version ?? ""} ${data.year}`, vehicleId ?? undefined);

  if (vehicleId) {
    await db.vehicle.update({ where: { id: vehicleId }, data: { ...data, slug } });
    stockChanged();
    return { message: "Cambios guardados" };
  }

  const vehicle = await db.vehicle.create({ data: { ...data, slug } });
  updateTag(VEHICLES_TAG);
  redirect(`/admin/vehiculos/${vehicle.id}?nuevo=1`);
}

export async function deleteVehicle(vehicleId: string) {
  await requireUser();
  if ((await db.sale.count({ where: { vehicleId } })) > 0) {
    return { error: "Este vehículo tiene una venta registrada. Anulá la venta antes de eliminarlo." };
  }
  const images = await db.vehicleImage.findMany({ where: { vehicleId }, select: { path: true } });
  await db.vehicle.delete({ where: { id: vehicleId } });
  await Promise.all(images.map((img) => deleteImage(img.path)));
  updateTag(VEHICLES_TAG);
  redirect("/admin/vehiculos");
}

export async function setVehicleStatus(vehicleId: string, status: string) {
  await requireUser();
  if (!(status in STATUSES)) return;
  await db.vehicle.update({ where: { id: vehicleId }, data: { status } });
  stockChanged();
}

export async function togglePublished(vehicleId: string) {
  await requireUser();
  const vehicle = await db.vehicle.findUniqueOrThrow({ where: { id: vehicleId }, select: { published: true } });
  await db.vehicle.update({ where: { id: vehicleId }, data: { published: !vehicle.published } });
  stockChanged();
}

export async function uploadVehicleImage(vehicleId: string, formData: FormData) {
  await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No se recibió la imagen" };

  let path: string;
  try {
    path = await saveImage(`vehiculos/${vehicleId}`, file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar la imagen" };
  }
  const last = await db.vehicleImage.findFirst({
    where: { vehicleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  await db.vehicleImage.create({ data: { vehicleId, path, position: (last?.position ?? -1) + 1 } });
  stockChanged();
  return { ok: true };
}

export async function deleteVehicleImage(imageId: string) {
  await requireUser();
  const image = await db.vehicleImage.delete({ where: { id: imageId } });
  await deleteImage(image.path);
  stockChanged();
}

/** Mueve una foto: "first" la deja como portada, -1/1 la corre un lugar. */
export async function moveVehicleImage(imageId: string, move: "first" | -1 | 1) {
  await requireUser();
  const image = await db.vehicleImage.findUniqueOrThrow({ where: { id: imageId } });
  const images = await db.vehicleImage.findMany({
    where: { vehicleId: image.vehicleId },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  const ids = images.map((i) => i.id);
  const from = ids.indexOf(imageId);
  const to = move === "first" ? 0 : Math.max(0, Math.min(ids.length - 1, from + move));
  ids.splice(to, 0, ...ids.splice(from, 1));

  await db.$transaction(ids.map((id, position) => db.vehicleImage.update({ where: { id }, data: { position } })));
  stockChanged();
}
