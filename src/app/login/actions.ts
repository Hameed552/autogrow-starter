"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  setSession,
  verifyPassword,
  writeAudit,
} from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const mfaCode = String(formData.get("mfaCode") ?? "").trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=credentials");
  }

  if (user.mfaEnabled && user.mfaSecret) {
    if (!mfaCode) redirect("/login?mfa=1&error=mfa");
    if (!verifyTotp(user.mfaSecret, mfaCode)) {
      redirect("/login?mfa=1&error=mfa");
    }
  }

  await setSession(user.email);
  await writeAudit({
    workspaceId: user.workspaceId,
    actorEmail: user.email,
    action: "login",
    entityType: "user",
    entityId: user.id,
  });
  redirect("/app");
}

export async function logoutAction() {
  const { clearSession, getSessionUser } = await import("@/lib/auth");
  const user = await getSessionUser();
  if (user) {
    await writeAudit({
      workspaceId: user.workspaceId,
      actorEmail: user.email,
      action: "logout",
      entityType: "user",
      entityId: user.id,
    });
  }
  await clearSession();
  redirect("/login");
}
