import { MarketingShell } from "@/components/shell";
import { Card } from "@/components/ui";

export const metadata = { title: "References" };

export default function ReferencesPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">References</h1>
        <p className="mt-3 text-[var(--muted)]">
          Peer-set buyers need named proof. We publish only references we can
          back — no invented logos.
        </p>

        <Card className="mt-10">
          <h2 className="font-semibold">Pilot cohort (recruiting)</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            IronSight is onboarding GCC food & beverage manufacturers for a
            documented pilot: lot costing, VAT invoicing, and recall drill.
            Early references will appear here with company permission.
          </p>
          <p className="mt-4 text-sm">
            Want to be a design partner?{" "}
            <a
              className="font-medium text-[var(--accent)] underline"
              href="mailto:hello@ironsight.ae"
            >
              hello@ironsight.ae
            </a>
          </p>
        </Card>

        <Card className="mt-4">
          <h2 className="font-semibold">What we will not do</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            No fake testimonials, no borrowed enterprise logos, no “trusted by
            500 plants” until the count is real.
          </p>
        </Card>
      </div>
    </MarketingShell>
  );
}
