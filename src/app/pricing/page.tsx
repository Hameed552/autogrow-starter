import { MarketingShell } from "@/components/shell";
import { ButtonLink, Card } from "@/components/ui";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  const tiers = [
    {
      name: "Pilot",
      price: "AED 0",
      period: "for qualified design partners",
      points: [
        "1 workspace",
        "Lot inventory + production costing",
        "UAE VAT invoices",
        "Accounting CSV export",
      ],
    },
    {
      name: "Plant",
      price: "AED 1,490",
      period: "/ month · billed annually",
      points: [
        "Unlimited lots & batches",
        "Traceability + recall",
        "Multi-user roles",
        "Priority support (Gulf hours)",
      ],
    },
    {
      name: "Group",
      price: "Custom",
      period: "multi-site · residency · SSO",
      points: [
        "UAE data residency option",
        "SSO / MFA required",
        "Live accounting sync (when GA)",
        "Implementation partner",
      ],
    },
  ];

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">Pricing</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Transparent AED pricing for Gulf plants. Implementation is scoped —
          we do not hide six-figure services behind “contact sales” alone.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.name} className="flex flex-col">
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-3 font-display text-3xl font-semibold">
                {t.price}
              </p>
              <p className="text-sm text-[var(--muted)]">{t.period}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-[var(--muted)]">
                {t.points.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
              <div className="mt-6">
                <ButtonLink href="/app">
                  {t.name === "Group" ? "Talk to us" : "Try demo"}
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
