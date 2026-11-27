"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeBlast } from "@/lib/recall-blast";
import { writeAudit } from "@/lib/auth";

export async function runRecallDrill(formData: FormData) {
  const lotId = String(formData.get("lotId") ?? "");
  const workspace = await prisma.workspace.findFirst();
  if (!workspace || !lotId) redirect("/app/recall");

  const lot = await prisma.inventoryLot.findUnique({
    where: { id: lotId },
    include: { material: true, product: true },
  });
  if (!lot) redirect("/app/recall");

  const batches = await prisma.productionBatch.findMany({
    where: { workspaceId: workspace.id },
    include: {
      product: true,
      consumptions: true,
    },
  });
  const deliveries = await prisma.lotDelivery.findMany({
    where: { lot: { workspaceId: workspace.id } },
    include: { lot: true, invoice: true },
  });
  const fgLots = await prisma.inventoryLot.findMany({
    where: { workspaceId: workspace.id, itemType: "finished_product" },
  });

  const related = batches.filter((b) =>
    b.consumptions.some((c) => c.lotId === lot.id),
  );

  const blast = computeBlast({
    lotId: lot.id,
    lotNumber: lot.lotNumber,
    itemType: lot.itemType,
    materialName: lot.material?.name,
    productName: lot.product?.name,
    consumptions: related.flatMap((b) =>
      b.consumptions
        .filter((c) => c.lotId === lot.id)
        .map((c) => ({
          batchId: b.id,
          batchNumber: b.batchNumber,
          productName: b.product.name,
          outputLotId: b.outputLotId,
          qtyUsed: c.qtyUsed,
        })),
    ),
    deliveries: deliveries.map((d) => ({
      lotId: d.lotId,
      lotNumber: d.lot.lotNumber,
      customerName: d.customerName,
      qty: d.qty,
      invoiceNumber: d.invoice?.number,
      deliveredAt: d.deliveredAt,
    })),
    fgLotsFromBatches: fgLots.map((f) => ({
      lotId: f.id,
      lotNumber: f.lotNumber,
      batchId: "",
      qtyRemaining: f.qtyRemaining,
      qtyInitial: f.qtyInitial,
    })),
  });

  const recall = await prisma.recall.create({
    data: {
      workspaceId: workspace.id,
      lotId: lot.id,
      reason: `Drill — suspect ${lot.lotNumber}`,
      status: "open",
      customerCount: blast.customerCount,
      qtyAtRisk: blast.qtyAtRisk,
      blastJson: JSON.stringify(blast),
    },
  });

  await writeAudit({
    workspaceId: workspace.id,
    action: "recall_opened",
    entityType: "recall",
    entityId: recall.id,
    detail: `severity=${blast.severity};customers=${blast.customerCount}`,
  });

  redirect("/app/recall");
}
