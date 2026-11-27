import { MarketingShell } from "@/components/shell";
import { ButtonLink } from "@/components/ui";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1586195831800-24f14c992cea?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
          aria-hidden
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0f1f1a]/92 via-[#0f1f1a]/75 to-[#0f1f1a]/35" />
        <div className="mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6">
          <p className="font-display text-5xl font-semibold tracking-tight text-white sm:text-7xl">
            IronSight
          </p>
          <h1 className="mt-4 max-w-xl text-xl font-medium text-white/90 sm:text-2xl">
            The operations system Gulf food plants actually run on.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Lot traceability, FEFO costing that never posts 0.00, UAE VAT
            invoices, and journal exports your accountant can import.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/app">Open live demo</ButtonLink>
            <ButtonLink href="/trust" variant="secondary">
              Trust center
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">
          Built for one job: Gulf food ops
        </h2>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Not a generic mega-suite. Inventory, production, sales, recall, and
          accounting handoff — with residency and security claims you can
          verify.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              t: "Real unit costing",
              d: "Finished goods inherit FIFO/FEFO lot costs. No more AED 0.00 FG valuations.",
            },
            {
              t: "UAE VAT ready",
              d: "5% output VAT, TRN fields, emirate on invoices, FTA-friendly journal lines.",
            },
            {
              t: "Accounting path",
              d: "CSV journals mapped for Xero / QBO / Zoho. Live sync is on the roadmap — export ships today.",
            },
          ].map((item) => (
            <div key={item.t}>
              <h3 className="text-lg font-semibold text-[var(--ink)]">
                {item.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
