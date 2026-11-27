"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { allocateFefo } from "@/lib/fefo";
import { writeAudit } from "@/lib/auth";

export async function createFefoPick(formData: FormData) {
  const qty = Number(formData.get("qty") ?? 30);
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) redirect("/app/picking");

  const product = await prisma.finishedProduct.findFirst({
    where: { workspaceId: workspace.id },
  });
  if (!product) redirect("/app/picking");

  const lots = await prisma.inventoryLot.findMany({
    where: {
      workspaceId: workspace.id,
      itemType: "finished_product",
      productId: product.id,
    },
  });

  const alloc = allocateFefo({
    productId: product.id,
    qtyRequired: qty,
    lots: lots.map((l) => ({
      id: l.id,
      lotNumber: l.lotNumber,
      productId: l.productId!,
      qtyRemaining: l.qtyRemaining,
      expiresAt: l.expiresAt,
      receivedAt: l.receivedAt,
      qcStatus: l.qcStatus,
      status: l.status,
    })),
  });

  const count = await prisma.pickOrder.count({
    where: { workspaceId: workspace.id },
  });
  const number = `PICK-2026-${String(count + 1).padStart(4, "0")}`;
  const status = alloc.shortfall > 0 ? "blocked" : "fulfilled";

  const pick = await prisma.pickOrder.create({
    data: {
      workspaceId: workspace.id,
      number,
      status,
      lines: {
        create: alloc.allocations.length
          ? alloc.allocations.map((a) => ({
              productId: product.id,
              qtyRequired: a.qty,
              qtyPicked: status === "fulfilled" ? a.qty : 0,
              lotId: a.lotId,
              blockedReason: alloc.blockedReason,
            }))
          : [
              {
                productId: product.id,
                qtyRequired: qty,
                qtyPicked: 0,
                blockedReason: alloc.blockedReason ?? "No eligible lots",
              },
            ],
      },
    },
  });

  if (status === "fulfilled") {
    for (const a of alloc.allocations) {
      await prisma.inventoryLot.update({
        where: { id: a.lotId },
        data: { qtyRemaining: { decrement: a.qty } },
      });
    }
  }

  await writeAudit({
    workspaceId: workspace.id,
    action: status === "fulfilled" ? "pick_fulfilled" : "pick_blocked",
    entityType: "pick_order",
    entityId: pick.id,
    detail: `${number} qty=${qty} shortfall=${alloc.shortfall}`,
  });

  redirect("/app/picking");
}
