import { MarketingShell } from "@/components/shell";
import { Badge, Card } from "@/components/ui";

export const metadata = { title: "Status" };

const SERVICES = [
  { name: "App / API", status: "operational" },
  { name: "Database", status: "operational" },
  { name: "Auth / MFA", status: "operational" },
  { name: "Accounting export", status: "operational" },
  { name: "Live Xero / QBO sync", status: "planned" },
  { name: "Email notifications", status: "degraded" },
];

export default function StatusPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">System status</h1>
        <p className="mt-3 text-[var(--muted)]">
          Public status for buyers who need vendor trust. Updated with this
          rebuild — not a vanity page.
        </p>

        <Card className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Overall</h2>
            <Badge tone="success">operational</Badge>
          </div>
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {SERVICES.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span>{s.name}</span>
                <Badge
                  tone={
                    s.status === "operational"
                      ? "success"
                      : s.status === "planned"
                        ? "neutral"
                        : "warn"
                  }
                >
                  {s.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mt-4">
          <h2 className="font-semibold">SLA (Plant & Group)</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>Support: Sun–Thu 09:00–18:00 Asia/Dubai</li>
            <li>Critical response target: 4 business hours (Group)</li>
            <li>RPO / backups: daily · restore drill quarterly</li>
            <li>Status incidents posted here within 1 hour of confirm</li>
          </ul>
        </Card>
      </div>
    </MarketingShell>
  );
}
