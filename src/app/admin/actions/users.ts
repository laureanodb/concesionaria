"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { fieldErrors, userSchema } from "@/lib/validation";

export type UserFormState = { errors?: Record<string, string>; message?: string; ok?: boolean };

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  await requireAdmin();
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { password, ...data } = parsed.data;
  const exists = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (exists) return { errors: { email: "Ya existe un usuario con ese email" } };

  await db.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) } });
  refresh();
  return { ok: true, message: `Usuario ${data.name} creado` };
}

export async function toggleUserActive(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) return; // nadie se desactiva a sí mismo
  const user = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { active: true } });
  await db.user.update({ where: { id: userId }, data: { active: !user.active } });
  refresh();
}

export type ResetPasswordState = { error?: string; ok?: boolean };

/** El administrador define una contraseña nueva para un usuario (también para sí mismo). */
export async function resetUserPassword(
  userId: string,
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireAdmin();
  const parsed = userSchema.shape.password.safeParse(formData.get("password"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(parsed.data, 10) } });
  return { ok: true };
}
