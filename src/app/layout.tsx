import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { SITE_NAME } from "@/lib/constants";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  openGraph: { siteName: SITE_NAME, locale: "es_AR", type: "website" },
  title: { default: `${SITE_NAME} | Autos 0 km y usados`, template: `%s | ${SITE_NAME}` },
  description: `${SITE_NAME}: autos 0 km y usados seleccionados. Financiación y tomamos tu usado.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${geistSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {children}
        {/* Las estadísticas de visitas solo existen una vez publicado en Vercel. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
