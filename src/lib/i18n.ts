/**
 * Arabic / English foundation for GCC buyers.
 * Full UI translation expands from these keys — bilingual labels ship on critical surfaces first.
 */

export type Locale = "en" | "ar";

const strings = {
  en: {
    appName: "IronSight",
    dashboard: "Dashboard",
    inventory: "Inventory",
    production: "Production",
    sales: "Sales & VAT",
    traceability: "Traceability",
    accounting: "Accounting export",
    unitCost: "Unit cost",
    trustCenter: "Trust center",
  },
  ar: {
    appName: "آيرون سايت",
    dashboard: "لوحة التحكم",
    inventory: "المخزون",
    production: "الإنتاج",
    sales: "المبيعات والضريبة",
    traceability: "التتبع",
    accounting: "تصدير المحاسبة",
    unitCost: "تكلفة الوحدة",
    trustCenter: "مركز الثقة",
  },
} as const;

export type MessageKey = keyof typeof strings.en;

export function t(locale: Locale, key: MessageKey) {
  return strings[locale][key];
}

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
