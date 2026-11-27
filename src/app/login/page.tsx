import { MarketingShell } from "@/components/shell";
import { Card } from "@/components/ui";
import { loginAction } from "./actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mfa?: string }>;
}) {
  const sp = await searchParams;
  return (
    <MarketingShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Demo: <code className="text-[var(--ink)]">demo@ironsight.ae</code> /{" "}
          <code className="text-[var(--ink)]">demo1234</code>
        </p>
        <Card className="mt-8">
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue="demo@ironsight.ae"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                defaultValue="demo1234"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              />
            </div>
            {sp.mfa === "1" || sp.error === "mfa" ? (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  MFA code
                </label>
                <input
                  name="mfaCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="6-digit code"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>
            ) : null}
            {sp.error ? (
              <p className="text-sm text-amber-800">
                {sp.error === "credentials"
                  ? "Invalid email or password."
                  : sp.error === "mfa"
                    ? "Enter a valid MFA code."
                    : "Sign-in failed."}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white"
            >
              Sign in
            </button>
          </form>
        </Card>
      </div>
    </MarketingShell>
  );
}
