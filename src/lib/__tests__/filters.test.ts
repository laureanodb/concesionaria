import { describe, expect, it } from "vitest";
import { hasActiveFilters, parseFilters } from "../filters";

describe("parseFilters", () => {
  it("ignora valores vacíos e inválidos", () => {
    const f = parseFilters({ q: "", condicion: "CUALQUIERA", precioMax: "abc", orden: "x" });
    expect(f).toEqual(expect.objectContaining({ q: undefined, condicion: undefined, precioMax: undefined, orden: "recientes" }));
    expect(hasActiveFilters(f)).toBe(false);
  });

  it("acepta filtros válidos y números con puntos", () => {
    const f = parseFilters({ condicion: "USADO", precioMax: "25.000", moneda: "USD", carroceria: "SUV", orden: "precio-asc" });
    expect(f).toMatchObject({ condicion: "USADO", precioMax: 25000, moneda: "USD", carroceria: "SUV", orden: "precio-asc" });
    expect(hasActiveFilters(f)).toBe(true);
  });

  it("toma el primer valor si el parámetro se repite", () => {
    expect(parseFilters({ marca: ["Ford", "Fiat"] }).marca).toBe("Ford");
  });
});
