import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/format";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" }),
});

const SAMPLE_VEHICLES = [
  { brand: "Toyota", model: "Corolla", version: "2.0 XEI CVT", year: 2022, km: 38000, price: 24500, currency: "USD", condition: "USADO", fuel: "NAFTA", transmission: "AUTOMATICA", bodyType: "SEDAN", color: "Gris plata", doors: 4, featured: true, description: "Único dueño, services oficiales al día. Cubiertas nuevas." },
  { brand: "Volkswagen", model: "Amarok", version: "V6 Highline 4x4", year: 2021, km: 72000, price: 39000, currency: "USD", condition: "USADO", fuel: "DIESEL", transmission: "AUTOMATICA", bodyType: "PICKUP", color: "Blanco", doors: 4, featured: true, description: "Cuero, cámara de retroceso, cúpula. Impecable." },
  { brand: "Fiat", model: "Cronos", version: "1.3 Drive", year: 2025, km: 0, price: 26900000, currency: "ARS", condition: "NUEVO", fuel: "NAFTA", transmission: "MANUAL", bodyType: "SEDAN", color: "Rojo", doors: 4, featured: true, description: "0 km, entrega inmediata. Consultá financiación." },
  { brand: "Peugeot", model: "208", version: "1.6 Allure", year: 2020, km: 54000, price: 15800, currency: "USD", condition: "USADO", fuel: "NAFTA", transmission: "MANUAL", bodyType: "HATCHBACK", color: "Azul", doors: 5, featured: false, description: null },
  { brand: "Ford", model: "Ranger", version: "3.2 Limited 4x4", year: 2019, km: 98000, price: 29500, currency: "USD", condition: "USADO", fuel: "DIESEL", transmission: "AUTOMATICA", bodyType: "PICKUP", color: "Negro", doors: 4, featured: false, description: "Muy buen estado general." },
  { brand: "Renault", model: "Duster", version: "1.6 Intens", year: 2023, km: 21000, price: 19900, currency: "USD", condition: "USADO", fuel: "NAFTA", transmission: "MANUAL", bodyType: "SUV", color: "Naranja", doors: 5, featured: false, description: null },
  { brand: "Chevrolet", model: "Tracker", version: "1.2T Premier", year: 2025, km: 0, price: 38500000, currency: "ARS", condition: "NUEVO", fuel: "NAFTA", transmission: "AUTOMATICA", bodyType: "SUV", color: "Blanco", doors: 5, featured: true, description: "0 km. Bonificación especial por pago contado." },
  { brand: "Volkswagen", model: "Gol Trend", version: "1.6 Comfortline", year: 2017, km: 112000, price: 8900, currency: "USD", condition: "USADO", fuel: "GNC", transmission: "MANUAL", bodyType: "HATCHBACK", color: "Gris", doors: 5, featured: false, description: "Equipo de GNC de 5ta generación con oblea al día." },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@automotoreslaureano.com.ar").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "cambiar-esta-clave";

  const existing = await db.user.findUnique({ where: { email } });
  if (!existing) {
    await db.user.create({
      data: { name: "Administrador", email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
    });
    console.log(`Usuario administrador creado: ${email}`);
  } else {
    console.log(`El usuario ${email} ya existía, no se modificó.`);
  }

  if ((await db.vehicle.count()) === 0) {
    for (const v of SAMPLE_VEHICLES) {
      await db.vehicle.create({
        data: { ...v, slug: slugify(`${v.brand} ${v.model} ${v.version} ${v.year}`) },
      });
    }
    console.log(`${SAMPLE_VEHICLES.length} vehículos de ejemplo creados.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
