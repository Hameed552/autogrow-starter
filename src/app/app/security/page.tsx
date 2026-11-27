import { AppShell } from "@/components/shell";
import { Badge, Card, PageHeader } from "@/components/ui";

export default function AppSecurityPage() {
  const controls = [
    {
      name: "Role-based access",
      status: "designed",
      detail: "Owner / manager / operator / accountant roles in schema.",
    },
    {
      name: "MFA",
      status: "roadmap",
      detail: "TOTP MFA before production customer data — not claimed live yet.",
    },
    {
      name: "Data residency",
      status: "selectable",
      detail: "UAE / GCC region deployment option documented in Trust Center.",
    },
    {
      name: "Audit log",
      status: "roadmap",
      detail: "Immutable event log for inventory, batch complete, invoice issue.",
    },
    {
      name: "Encryption in transit",
      status: "standard",
      detail: "TLS on all hosted endpoints.",
    },
    {
      name: "Pharma / GxP claims",
      status: "out of scope",
      detail: "We do not claim pharma validation. Food & FMCG only.",
    },
  ];

  return (
    <AppShell active="/app/security">
      <PageHeader
        title="Security posture"
        subtitle="What is shipped, what is roadmap — no overstated compliance."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {controls.map((c) => (
          <Card key={c.name}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-[var(--ink)]">{c.name}</h2>
              <Badge
                tone={
                  c.status === "out of scope"
                    ? "warn"
                    : c.status === "roadmap"
                      ? "neutral"
                      : "success"
                }
              >
                {c.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{c.detail}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
