import { createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
export { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_COOKIE = "ironsight_session";
const SESSION_DAYS = 7;

export function sessionTokenFor(email: string) {
  const secret = process.env.SESSION_SECRET ?? "ironsight-dev-secret";
  const day = Math.floor(Date.now() / 86400000);
  return createHash("sha256")
    .update(`${email}:${secret}:${day}`)
    .digest("hex");
}

export async function setSession(email: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${email}|${sessionTokenFor(email)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [email, token] = raw.split("|");
  if (!email || !token) return null;
  if (token !== sessionTokenFor(email)) return null;
  return prisma.user.findUnique({
    where: { email },
    include: { workspace: true },
  });
}

export async function writeAudit(params: {
  workspaceId: string;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  detail?: string;
}) {
  return prisma.auditLog.create({ data: params });
}
