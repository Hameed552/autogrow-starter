"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildBuyingPlan } from "@/lib/buying-plan";
import { calcVat } from "@/lib/vat";
import { writeAudit } from "@/lib/auth";

export async function createPosFromPlan() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) redirect("/app/buying");

  const materials = await prisma.rawMaterial.findMany({
    where: { workspaceId: workspace.id },
    include: { lots: true, supplier: true },
  });

  const plan = buildBuyingPlan(
    materials.map((m) => ({
      materialId: m.id,
      materialName: m.name,
      unit: m.unit,
      minLevel: m.minLevel,
      onHand: m.lots.reduce((s, l) => s + l.qtyRemaining, 0),
      unitCostAed: m.unitCostAed,
      supplierId: m.supplierId,
      supplierName: m.supplier?.name ?? null,
    })),
  );

  let created = 0;
  for (const sug of plan) {
    const vat = calcVat(sug.subtotalAed);
    const count = await prisma.purchaseOrder.count({
      where: { workspaceId: workspace.id },
    });
    const number = `PO-2026-${String(count + 1).padStart(4, "0")}`;
    const po = await prisma.purchaseOrder.create({
      data: {
        workspaceId: workspace.id,
        number,
        supplierId: sug.supplierId,
        status: "open",
        subtotalAed: vat.subtotalAed,
        vatAed: vat.vatAed,
        source: "buying_plan",
        lines: {
          create: sug.lines.map((l) => ({
            materialId: l.materialId,
            qty: l.qtyToOrder,
            unitCostAed: l.unitCostAed,
          })),
        },
      },
    });
    await writeAudit({
      workspaceId: workspace.id,
      action: "po_from_buying_plan",
      entityType: "purchase_order",
      entityId: po.id,
      detail: number,
    });
    created += 1;
  }

  redirect(created ? "/app/buying?ok=1" : "/app/buying");
}
