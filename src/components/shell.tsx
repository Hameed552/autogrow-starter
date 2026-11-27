import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/inventory", label: "Inventory" },
  { href: "/app/production", label: "Production" },
  { href: "/app/sales", label: "Sales & VAT" },
  { href: "/app/traceability", label: "Traceability" },
  { href: "/app/accounting", label: "Accounting export" },
  { href: "/app/security", label: "Security" },
];

const TRUST = [
  { href: "/trust", label: "Trust center" },
  { href: "/security", label: "Security" },
  { href: "/references", label: "References" },
  { href: "/pricing", label: "Pricing" },
];

export function AppShell({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 md:block">
          <a href="/" className="mb-8 block px-2">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)]">
              IronSight
            </span>
            <span className="mt-0.5 block text-xs text-[var(--muted)]">
              GCC food & FMCG ERP
            </span>
          </a>
          <nav className="space-y-1">
            {NAV.map((item) => (
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
                {item.label}
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
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a
            href="/"
            className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)]"
          >
            IronSight
          </a>
          <nav className="flex items-center gap-4 text-sm">
            <a href="/trust" className="text-slate-600 hover:text-[var(--ink)]">
              Trust
            </a>
            <a
              href="/references"
              className="text-slate-600 hover:text-[var(--ink)]"
            >
              References
            </a>
            <a
              href="/pricing"
              className="text-slate-600 hover:text-[var(--ink)]"
            >
              Pricing
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
