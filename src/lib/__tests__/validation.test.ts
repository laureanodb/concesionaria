import { describe, expect, it } from "vitest";
import { fieldErrors, vehicleSchema } from "../validation";

const base = {
  brand: "Toyota", model: "Corolla", version: "", year: "2022", km: "38.000", price: "24.500",
  currency: "USD", condition: "USADO", fuel: "NAFTA", transmission: "AUTOMATICA", bodyType: "SEDAN",
  color: "", doors: "4", description: "", status: "DISPONIBLE", published: true, featured: false,
};

describe("vehicleSchema", () => {
  it("convierte los valores del formulario", () => {
    const v = vehicleSchema.parse(base);
    expect(v).toMatchObject({ year: 2022, km: 38000, price: 24500, doors: 4, version: null, color: null });
  });

  it("marca los campos con error", () => {
    const r = vehicleSchema.safeParse({ ...base, model: "", year: "1800", price: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(Object.keys(fieldErrors(r.error))).toEqual(["model", "year", "price"]);
  });

  it("no permite un 0 km con muchos kilómetros", () => {
    const r = vehicleSchema.safeParse({ ...base, condition: "NUEVO", km: "50000" });
    expect(r.success).toBe(false);
  });
});
