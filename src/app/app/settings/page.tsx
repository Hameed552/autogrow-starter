import { AppShell } from "@/components/shell";
import { Card, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { updateWorkspaceSettings } from "./actions";

export const dynamic = "force-dynamic";

const RESIDENCIES = ["UAE", "Bahrain", "KSA", "GCC-shared", "EU"] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const sp = await searchParams;
  const workspace = await prisma.workspace.findFirst();

  return (
    <AppShell active="/app/settings">
      <PageHeader
        title="Workspace settings"
        subtitle="Locale (Arabic RTL) and contractual data residency region."
      />

      {!workspace ? (
        <p>Seed the demo first.</p>
      ) : (
        <Card className="max-w-xl">
          <form action={updateWorkspaceSettings} className="space-y-5">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Language / اتجاه
              </label>
              <select
                name="locale"
                defaultValue={workspace.locale}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <option value="en">English (LTR)</option>
                <option value="ar">العربية (RTL)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Data residency
              </label>
              <select
                name="dataResidency"
                defaultValue={workspace.dataResidency}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                {RESIDENCIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Paid contracts pin this region. Demo may still run on shared
                infra until Group deploy.
              </p>
            </div>
            <div className="text-sm text-[var(--muted)]">
              SLA tier: <strong className="text-[var(--ink)]">{workspace.slaTier}</strong>
              {" · "}
              Support hours: Sun–Thu 09:00–18:00 Gulf
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white"
            >
              Save settings
            </button>
            {sp.ok ? (
              <p className="text-sm text-emerald-800">Saved — shell will flip RTL if Arabic.</p>
            ) : null}
          </form>
        </Card>
      )}
    </AppShell>
  );
}
