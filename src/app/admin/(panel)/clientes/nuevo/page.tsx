import type { Metadata } from "next";
import { CustomerForm } from "@/components/admin/CustomerForm";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="Nuevo cliente" />
      <CustomerForm customerId={null} defaults={{ name: "", phone: "", email: "", dni: "", address: "", notes: "" }} />
    </>
  );
}
