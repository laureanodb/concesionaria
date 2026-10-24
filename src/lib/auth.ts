import "server-only";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getSession } from "./session";

export type CurrentUser = { id: string; name: string; email: string; role: string };

/** Devuelve el usuario logueado o redirige al login. Usar en páginas y acciones del panel. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  if (!user || !user.active) redirect("/admin/login");

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}
