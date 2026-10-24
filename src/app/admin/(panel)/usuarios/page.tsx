import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";
import { UserForm } from "@/components/admin/UserForm";
import { requireAdmin } from "@/lib/auth";
import { ROLES, label } from "@/lib/constants";
import { db } from "@/lib/db";
import { toggleUserActive } from "../../actions/users";

export const metadata: Metadata = { title: "Usuarios" };

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Usuarios" />
      <Suspense fallback={<PanelSkeleton />}>
        <Users />
      </Suspense>
    </>
  );
}

async function Users() {
  const me = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-6">
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{label(ROLES, u.role)}</td>
                <td className="p-3">{u.active ? "Activo" : "Desactivado"}</td>
                <td className="p-3 text-right">
                  <div className="flex flex-wrap items-start justify-end gap-x-4 gap-y-2">
                    <ResetPasswordForm userId={u.id} userName={u.name} />
                    {u.id !== me.id && (
                      <form action={toggleUserActive.bind(null, u.id)}>
                        <button className="font-semibold text-brand-600 hover:underline">
                          {u.active ? "Desactivar" : "Reactivar"}
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UserForm />
    </div>
  );
}
