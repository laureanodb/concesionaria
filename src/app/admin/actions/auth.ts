"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearHits, clientIp, isRateLimited, recordHit } from "@/lib/rate-limit";
import { createSession, deleteSession } from "@/lib/session";
import { fieldErrors, loginSchema, userSchema } from "@/lib/validation";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: "Completá email y contraseña", email };

  // Máximo 5 intentos fallidos por cuenta y 20 por conexión cada 15 minutos.
  const WINDOW = 15 * 60 * 1000;
  const emailKey = `login:${parsed.data.email}`;
  const ipKey = `login-ip:${await clientIp()}`;
  if ((await isRateLimited(emailKey, 5, WINDOW)) || (await isRateLimited(ipKey, 20, WINDOW))) {
    return { error: "Demasiados intentos fallidos. Esperá 15 minutos y volvé a probar.", email };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = user?.active && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !valid) {
    await Promise.all([recordHit(emailKey), recordHit(ipKey)]);
    return { error: "Email o contraseña incorrectos", email };
  }
  await clearHits(emailKey);

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export type SetupState = { errors?: Record<string, string>; values?: Record<string, string> };

/** Crea el primer administrador. Solo funciona mientras no exista ningún usuario. */
export async function createFirstAdmin(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const values = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  const parsed = userSchema.safeParse({ ...values, password: formData.get("password"), role: "ADMIN" });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { password, ...data } = parsed.data;
  const user = await db.$transaction(async (tx) => {
    if ((await tx.user.count()) > 0) return null;
    return tx.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) } });
  });
  if (!user) redirect("/admin/login");

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect("/admin");
}
