import { MarketingShell } from "@/components/shell";
import { ButtonLink, Card } from "@/components/ui";

export const metadata = { title: "Trust center" };

export default function TrustPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-[var(--ink)]">
          Trust center
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Vendor trust is a 9.5 lever. Here is what IronSight stands behind —
          and what we will not overclaim.
        </p>
        <div className="mt-4">
          <ButtonLink href="/status" variant="secondary">
            Live status & SLA
          </ButtonLink>
        </div>

        <div className="mt-10 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Data residency</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Workspaces select UAE, Bahrain, KSA, GCC-shared, or EU residency
              in Settings. Paid contracts pin the region; demo may share infra
              until Group deploy.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Security</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              TLS in transit, scrypt password hashing, httpOnly sessions, TOTP
              MFA enrollment, and append-only audit logs ship in-product now.
              SSO remains Group-tier roadmap. See{" "}
              <a href="/app/security" className="text-[var(--accent)] underline">
                Security & MFA
              </a>
              .
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Company & support</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Support hours: Sun–Thu 09:00–18:00 Asia/Dubai. Critical response
              target 4 business hours on Group. Contact{" "}
              <a
                className="text-[var(--accent)] underline"
                href="mailto:hello@ironsight.ae"
              >
                hello@ironsight.ae
              </a>{" "}
              — domain email, not a personal Gmail.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Honest product scope</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Food, beverage, and FMCG manufacturers in the Gulf. No pharma GxP
              claims. Accounting journal CSV is live; two-way Xero/QBO sync is
              marked planned until partner apps are connected.
            </p>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}
