"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSessionUser, writeAudit } from "@/lib/auth";
import { generateTotpSecret, otpauthUrl, verifyTotp } from "@/lib/totp";

export async function startMfaEnrollment() {
  const session = await getSessionUser();
  const user =
    session ??
    (await prisma.user.findUnique({ where: { email: "demo@ironsight.ae" } }));
  if (!user) redirect("/app/security?error=nouser");

  const secret = generateTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: secret, mfaEnabled: false, mfaVerifiedAt: null },
  });
  redirect("/app/security?enroll=1");
}

export async function confirmMfa(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const session = await getSessionUser();
  const user =
    session ??
    (await prisma.user.findUnique({ where: { email: "demo@ironsight.ae" } }));
  if (!user?.mfaSecret) redirect("/app/security?error=secret");

  if (!verifyTotp(user.mfaSecret, code)) {
    redirect("/app/security?enroll=1&error=code");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: true, mfaVerifiedAt: new Date() },
  });
  await writeAudit({
    workspaceId: user.workspaceId,
    actorEmail: user.email,
    action: "mfa_enabled",
    entityType: "user",
    entityId: user.id,
  });
  redirect("/app/security?ok=mfa");
}

export async function disableMfa() {
  const session = await getSessionUser();
  const user =
    session ??
    (await prisma.user.findUnique({ where: { email: "demo@ironsight.ae" } }));
  if (!user) redirect("/app/security");

  await prisma.user.update({
    where: { id: user.id },
    data: { mfaEnabled: false, mfaSecret: null, mfaVerifiedAt: null },
  });
  await writeAudit({
    workspaceId: user.workspaceId,
    actorEmail: user.email,
    action: "mfa_disabled",
    entityType: "user",
    entityId: user.id,
  });
  redirect("/app/security?ok=disabled");
}

export async function getEnrollmentUri(email: string, secret: string) {
  return otpauthUrl({ secret, email, issuer: "IronSight" });
}
