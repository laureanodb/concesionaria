import type { Metadata } from "next";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar al panel", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center bg-slate-100 px-4 py-16">
      <div className="card w-full max-w-sm space-y-6 p-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Panel de administración</h1>
          <p className="text-sm text-slate-500">Ingresá con tu usuario</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
