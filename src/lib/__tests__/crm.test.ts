import { describe, expect, it } from "vitest";
import { formatMonth, isoDateInArgentina, monthRange, phoneDigits } from "../format";
import { customerSchema, publicLeadSchema, saleSchema } from "../validation";

describe("fechas", () => {
  it("usa la fecha de Argentina aunque en UTC ya sea el día siguiente", () => {
    // 01:30 UTC del 1/11 = 22:30 del 31/10 en Argentina
    expect(isoDateInArgentina(new Date("2026-11-01T01:30:00Z"))).toBe("2026-10-31");
  });

  it("calcula el rango de un mes", () => {
    expect(monthRange("2026-12")).toEqual({
      from: new Date("2026-12-01T00:00:00Z"),
      to: new Date("2027-01-01T00:00:00Z"),
    });
    expect(monthRange("2026-13")).toBeNull();
    expect(monthRange("cualquier")).toBeNull();
    expect(formatMonth("2026-10")).toBe("Octubre de 2026");
  });
});

describe("publicLeadSchema", () => {
  const base = { type: "CONSULTA", name: "Ana Pérez", phone: "+54 9 11 1234-5678", email: "", message: "", preferredDate: "", vehicleId: "" };

  it("normaliza el teléfono y vacíos a null", () => {
    const lead = publicLeadSchema.parse(base);
    expect(lead).toMatchObject({ phone: "5491112345678", email: null, message: null, vehicleId: null });
    expect(phoneDigits("(011) 4444-5555")).toBe("01144445555");
  });

  it("rechaza teléfono o email inválidos", () => {
    const r = publicLeadSchema.safeParse({ ...base, phone: "abc", email: "no-es-mail" });
    expect(r.success).toBe(false);
    if (!r.success) expect([...new Set(r.error.issues.map((i) => i.path[0]))].sort()).toEqual(["email", "phone"]);
  });
});

describe("customerSchema", () => {
  it("permite cliente sin teléfono", () => {
    const c = customerSchema.parse({ name: "Juan", phone: "", email: "", dni: "", address: "", notes: "" });
    expect(c.phone).toBeNull();
  });
});

describe("saleSchema", () => {
  const base = {
    vehicleId: "v1", customerId: "", date: "2026-10-24", price: "24.000", currency: "USD",
    paymentMethod: "MIXTO", tradeIn: "", tradeInValue: "", notes: "",
  };

  it("convierte valores y deja el usado vacío", () => {
    expect(saleSchema.parse(base)).toMatchObject({ price: 24000, customerId: null, tradeIn: null, tradeInValue: null });
  });

  it("pide la descripción del usado si se cargó un valor", () => {
    const r = saleSchema.safeParse({ ...base, tradeInValue: "8.000" });
    expect(r.success).toBe(false);
    expect(saleSchema.parse({ ...base, tradeIn: "Gol 2015", tradeInValue: "8.000" }).tradeInValue).toBe(8000);
  });
});
