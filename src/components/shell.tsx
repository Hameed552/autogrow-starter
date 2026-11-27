import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { NAV_KEYS, dir, t, type Locale } from "@/lib/i18n";
import type { ReactNode } from "react";

const TRUST = [
  { href: "/trust", en: "Trust center", ar: "مركز الثقة" },
  { href: "/status", en: "Status", ar: "الحالة" },
  { href: "/references", en: "References", ar: "المراجع" },
  { href: "/pricing", en: "Pricing", ar: "الأسعار" },
];

async function resolveLocale(locale?: Locale): Promise<Locale> {
  if (locale) return locale;
  const ws = await prisma.workspace.findFirst({ select: { locale: true } });
  return ws?.locale === "ar" ? "ar" : "en";
}

export async function AppShell({
  children,
  active,
  locale: localeProp,
}: {
  children: ReactNode;
  active?: string;
  locale?: Locale;
}) {
  const locale = await resolveLocale(localeProp);
  const d = dir(locale);
  return (
    <div className="min-h-screen bg-[var(--bg)]" dir={d} lang={locale}>
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-60 shrink-0 border-[var(--border)] bg-[var(--surface)] px-4 py-6 md:block md:border-e">
          <a href="/app" className="mb-8 block px-2">
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              {t(locale, "appName")}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              {t(locale, "tagline")}
            </span>
          </a>
          <nav className="space-y-0.5">
            {NAV_KEYS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition",
                  active === item.href
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[var(--ink)]",
                )}
              >
                {t(locale, item.key)}
              </a>
            ))}
          </nav>
          <div className="mt-8 border-t border-[var(--border)] pt-4">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Public
            </p>
            <nav className="mt-2 space-y-1">
              {TRUST.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-[var(--ink)]"
                >
                  {locale === "ar" ? item.ar : item.en}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2 md:hidden">
            <a href="/app" className="shrink-0 font-display text-sm font-bold">
              {t(locale, "appName")}
            </a>
            {NAV_KEYS.slice(0, 6).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-xs",
                  active === item.href
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-slate-600",
                )}
              >
                {t(locale, item.key)}
              </a>
            ))}
          </div>
          <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <a
            href="/"
            className="font-display text-xl font-bold tracking-tight text-[var(--ink)]"
          >
            IronSight
          </a>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <a href="/trust" className="text-slate-600 hover:text-[var(--ink)]">
              Trust
            </a>
            <a href="/status" className="text-slate-600 hover:text-[var(--ink)]">
              Status
            </a>
            <a
              href="/references"
              className="hidden text-slate-600 hover:text-[var(--ink)] sm:inline"
            >
              References
            </a>
            <a href="/login" className="text-slate-600 hover:text-[var(--ink)]">
              Sign in
            </a>
            <a
              href="/app"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-white"
            >
              Open demo
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
