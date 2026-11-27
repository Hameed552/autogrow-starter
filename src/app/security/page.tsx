import { MarketingShell } from "@/components/shell";
import { Card } from "@/components/ui";

export const metadata = { title: "Security" };

export default function SecurityMarketingPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">Security</h1>
        <p className="mt-3 text-[var(--muted)]">
          Controls buyers ask for — stated without theater.
        </p>
        <div className="mt-10 grid gap-4">
          {[
            ["Access control", "Role-based permissions; least privilege by default."],
            ["Authentication", "Password hashing planned; MFA before GA for paid plans."],
            ["Encryption", "TLS 1.2+ in transit; disk encryption at rest on managed DB."],
            ["Backups", "Daily automated backups with tested restore runbook."],
            ["Incident response", "Security contact + 72h disclosure target for confirmed breaches."],
          ].map(([t, d]) => (
            <Card key={t}>
              <h2 className="font-semibold">{t}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
            </Card>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
