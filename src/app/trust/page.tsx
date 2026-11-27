import { MarketingShell } from "@/components/shell";
import { Card } from "@/components/ui";

export const metadata = { title: "Trust center" };

export default function TrustPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold text-[var(--ink)]">
          Trust center
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Vendor trust is a 9.5 lever. Here is what IronSight will stand behind —
          and what we will not overclaim.
        </p>

        <div className="mt-10 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Data residency</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Customer production data can be hosted in UAE / GCC-region
              infrastructure on request. Demo environments may run elsewhere;
              contracts specify the region for paid workspaces.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Security roadmap</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              TLS in transit is standard. MFA, SSO, and immutable audit logs are
              required before we market IronSight for regulated multi-site
              deployments. Status is tracked on the in-app Security page.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Honest product scope</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              IronSight is built for food, beverage, and FMCG manufacturers in
              the Gulf. We do not claim pharma GxP, hospital EMR, or full
              enterprise financial consolidation. Accounting export is
              available; live Xero/QBO sync ships when partner apps are live.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Subprocessors</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Hosting, email, and error monitoring subprocessors will be listed
              here before GA. Contact{" "}
              <a className="text-[var(--accent)] underline" href="mailto:security@ironsight.ae">
                security@ironsight.ae
              </a>{" "}
              for the current list.
            </p>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}
