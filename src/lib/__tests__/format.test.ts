import { describe, expect, it } from "vitest";
import { formatKm, formatPrice, slugify, toWhatsappNumber, whatsappLink } from "../format";

describe("format", () => {
  it("formatea precios en pesos y dólares", () => {
    expect(formatPrice(24500, "USD")).toBe("US$ 24.500");
    expect(formatPrice(26900000, "ARS")).toBe("$ 26.900.000");
  });

  it("formatea kilómetros", () => {
    expect(formatKm(0)).toBe("0 km");
    expect(formatKm(72000)).toBe("72.000 km");
  });

  it("genera slugs sin acentos ni símbolos", () => {
    expect(slugify("Peugeot 208 1.6 Allure Año 2020")).toBe("peugeot-208-1-6-allure-ano-2020");
  });

  it("arma el link de WhatsApp con el mensaje codificado", () => {
    expect(whatsappLink("+54 9 11 1234-5678", "Hola ¿sigue?")).toBe(
      "https://wa.me/5491112345678?text=Hola%20%C2%BFsigue%3F",
    );
  });
});

describe("toWhatsappNumber", () => {
  it.each([
    ["11 5555-1234", "5491155551234"],
    ["011 15 5555-1234", "5491155551234"],
    ["+54 9 11 5555-1234", "5491155551234"],
    ["54 11 5555-1234", "5491155551234"],
    ["0351 15 444-5555", "5493514445555"],
    ["(2944) 15 41-2345", "5492944412345"],
    ["5491100000000", "5491100000000"],
    ["+1 305 555 1234", "13055551234"],
  ])("%s → %s", (input, expected) => {
    expect(toWhatsappNumber(input)).toBe(expected);
  });
});
