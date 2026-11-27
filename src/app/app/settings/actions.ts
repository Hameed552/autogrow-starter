"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/auth";

export async function updateWorkspaceSettings(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const dataResidency = String(formData.get("dataResidency") ?? "UAE");
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) redirect("/app/settings?error=1");

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      locale: locale === "ar" ? "ar" : "en",
      dataResidency,
    },
  });
  await writeAudit({
    workspaceId: workspace.id,
    action: "settings_updated",
    entityType: "workspace",
    entityId: workspace.id,
    detail: `locale=${locale};residency=${dataResidency}`,
  });
  redirect("/app/settings?ok=1");
}
