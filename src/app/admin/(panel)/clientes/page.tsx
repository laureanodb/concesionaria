import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, PanelSkeleton } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, phoneDigits } from "@/lib/format";

export const metadata: Metadata = { title: "Clientes" };

export default function CustomersPage({ searchParams }: PageProps<"/admin/clientes">) {
  return (
    <>
      <PageHeader title="Clientes">
        <Link href="/admin/clientes/nuevo" className="btn-primary">+ Nuevo cliente</Link>
      </PageHeader>
      <Suspense fallback={<PanelSkeleton />}>
        <CustomerList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CustomerList({ searchParams }: Pick<PageProps<"/admin/clientes">, "searchParams">) {
  await requireUser();
  const { q: rawQ } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";
  const digits = phoneDigits(q);

  const customers = await db.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { dni: { contains: q, mode: "insensitive" } },
            ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { leads: true, sales: true } } },
  });

  return (
    <div className="space-y-4">
      <Form action="/admin/clientes" className="card flex flex-wrap items-end gap-3 p-3">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="field-label">Buscar</label>
          <input id="q" name="q" defaultValue={q} placeholder="Nombre, teléfono, email o DNI" className="input" />
        </div>
        <button className="btn-dark">Buscar</button>
      </Form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Consultas</th>
              <th className="p-3">Compras</th>
              <th className="p-3">Alta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/admin/clientes/${c.id}`} className="font-medium hover:text-brand-600">{c.name}</Link>
                </td>
                <td className="p-3 text-slate-600">
                  {c.phone ?? "—"}
                  {c.email && <span className="block text-xs">{c.email}</span>}
                </td>
                <td className="p-3">{c._count.leads}</td>
                <td className="p-3">{c._count.sales > 0 ? <strong>{c._count.sales}</strong> : 0}</td>
                <td className="p-3 text-slate-600">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-6 text-center text-slate-500">No se encontraron clientes.</p>}
      </div>
    </div>
  );
}
