/** UAE VAT: standard 5% on taxable supplies. Zero-rated / exempt handled per line later. */
export const UAE_VAT_RATE = 0.05;

export function calcVat(subtotalAed: number, rate = UAE_VAT_RATE) {
  const vat = Math.round(subtotalAed * rate * 100) / 100;
  return {
    subtotalAed: Math.round(subtotalAed * 100) / 100,
    vatAed: vat,
    totalAed: Math.round((subtotalAed + vat) * 100) / 100,
    rate,
  };
}

export const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;
