export type Locale = "en" | "ar";

const strings = {
  en: {
    appName: "IronSight",
    tagline: "GCC food & FMCG ERP",
    dashboard: "Dashboard",
    inventory: "Inventory",
    production: "Production",
    sales: "Sales & VAT",
    traceability: "Traceability",
    picking: "FEFO picking",
    recall: "Recall blast",
    buying: "Buying plan",
    variance: "Cost variance",
    accounting: "Accounting export",
    security: "Security & MFA",
    settings: "Settings",
    unitCost: "Unit cost",
    trustCenter: "Trust center",
    openDemo: "Open demo",
    signIn: "Sign in",
  },
  ar: {
    appName: "آيرون سايت",
    tagline: "نظام تشغيل لمصانع الأغذية في الخليج",
    dashboard: "لوحة التحكم",
    inventory: "المخزون",
    production: "الإنتاج",
    sales: "المبيعات والضريبة",
    traceability: "التتبع",
    picking: "انتقاء FEFO",
    recall: "نطاق الاستدعاء",
    buying: "خطة الشراء",
    variance: "انحراف التكلفة",
    accounting: "تصدير المحاسبة",
    security: "الأمان والتحقق",
    settings: "الإعدادات",
    unitCost: "تكلفة الوحدة",
    trustCenter: "مركز الثقة",
    openDemo: "فتح العرض",
    signIn: "تسجيل الدخول",
  },
} as const;

export type MessageKey = keyof typeof strings.en;

export function t(locale: Locale, key: MessageKey) {
  return strings[locale][key];
}

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export const NAV_KEYS: { href: string; key: MessageKey }[] = [
  { href: "/app", key: "dashboard" },
  { href: "/app/inventory", key: "inventory" },
  { href: "/app/production", key: "production" },
  { href: "/app/picking", key: "picking" },
  { href: "/app/buying", key: "buying" },
  { href: "/app/sales", key: "sales" },
  { href: "/app/traceability", key: "traceability" },
  { href: "/app/recall", key: "recall" },
  { href: "/app/variance", key: "variance" },
  { href: "/app/accounting", key: "accounting" },
  { href: "/app/security", key: "security" },
  { href: "/app/settings", key: "settings" },
];
