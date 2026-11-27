import { AppShell } from "@/components/shell";
import { Badge, Card, DataTable, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { otpauthUrl } from "@/lib/totp";
import {
  confirmMfa,
  disableMfa,
  startMfaEnrollment,
} from "./actions";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default async function AppSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ enroll?: string; error?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const user = await prisma.user.findUnique({
    where: { email: "demo@ironsight.ae" },
  });
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const enrollUri =
    sp.enroll === "1" && user?.mfaSecret
      ? otpauthUrl({ secret: user.mfaSecret, email: user.email })
      : null;

  return (
    <AppShell active="/app/security">
      <PageHeader
        title="Security & MFA"
        subtitle="Password auth, TOTP MFA, and audit log — required before paid customer data."
        actions={
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              Sign out
            </button>
          </form>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Multi-factor authentication</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                TOTP compatible with Google Authenticator / Authy.
              </p>
            </div>
            <Badge tone={user?.mfaEnabled ? "success" : "warn"}>
              {user?.mfaEnabled ? "enabled" : "off"}
            </Badge>
          </div>

          {enrollUri ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm break-all text-[var(--ink)]">{enrollUri}</p>
              <p className="text-xs text-[var(--muted)]">
                Secret: <code>{user?.mfaSecret}</code>
              </p>
              <form action={confirmMfa} className="flex gap-2">
                <input
                  name="code"
                  placeholder="6-digit code"
                  className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-white"
                >
                  Confirm
                </button>
              </form>
              {sp.error === "code" ? (
                <p className="text-sm text-amber-800">Invalid code — try again.</p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {!user?.mfaEnabled ? (
                <form action={startMfaEnrollment}>
                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm text-white"
                  >
                    Enroll MFA
                  </button>
                </form>
              ) : (
                <form action={disableMfa}>
                  <button
                    type="submit"
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    Disable MFA
                  </button>
                </form>
              )}
            </div>
          )}
          {sp.ok === "mfa" ? (
            <p className="mt-3 text-sm text-emerald-800">MFA enabled.</p>
          ) : null}
        </Card>

        <Card>
          <h2 className="font-semibold">Controls</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>✓ Password hashing (scrypt)</li>
            <li>✓ Session cookie (httpOnly)</li>
            <li>{user?.mfaEnabled ? "✓" : "○"} MFA enforced at login when enabled</li>
            <li>✓ Immutable-style audit log (append-only table)</li>
            <li>○ SSO (SAML/OIDC) — Group tier roadmap</li>
          </ul>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Recent audit events
      </h2>
      <DataTable
        headers={["When", "Actor", "Action", "Entity", "Detail"]}
        rows={logs.map((l) => [
          l.createdAt.toISOString().replace("T", " ").slice(0, 19),
          l.actorEmail ?? "system",
          l.action,
          `${l.entityType}${l.entityId ? `:${l.entityId.slice(-6)}` : ""}`,
          l.detail ?? "—",
        ])}
      />
    </AppShell>
  );
}
