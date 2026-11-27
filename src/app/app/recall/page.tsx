import { AppShell } from "@/components/shell";
import { Badge, Card, DataTable, PageHeader, Stat } from "@/components/ui";
import { computeBlast } from "@/lib/recall-blast";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { runRecallDrill } from "./actions";

export const dynamic = "force-dynamic";

export default async function RecallPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/recall">
        <PageHeader title="Recall blast" />
      </AppShell>
    );
  }

  const rmLot = await prisma.inventoryLot.findFirst({
    where: { workspaceId: workspace.id, itemType: "raw_material" },
    include: { material: true },
    orderBy: { receivedAt: "asc" },
  });

  const batches = await prisma.productionBatch.findMany({
    where: { workspaceId: workspace.id },
    include: {
      product: true,
      consumptions: { include: { lot: true } },
    },
  });

  const deliveries = await prisma.lotDelivery.findMany({
    where: { lot: { workspaceId: workspace.id } },
    include: { lot: true, invoice: true },
  });

  const fgLots = await prisma.inventoryLot.findMany({
    where: { workspaceId: workspace.id, itemType: "finished_product" },
  });

  const recalls = await prisma.recall.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });

  let liveBlast = null;
  if (rmLot) {
    const related = batches.filter((b) =>
      b.consumptions.some((c) => c.lotId === rmLot.id),
    );
    liveBlast = computeBlast({
      lotId: rmLot.id,
      lotNumber: rmLot.lotNumber,
      itemType: "raw_material",
      materialName: rmLot.material?.name,
      consumptions: related.flatMap((b) =>
        b.consumptions
          .filter((c) => c.lotId === rmLot.id)
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
  }

  return (
    <AppShell active="/app/recall">
      <PageHeader
        title="Recall blast radius"
        subtitle="One click from a suspect lot → batches, FG lots, and customers at risk."
        actions={
          rmLot ? (
            <form action={runRecallDrill}>
              <input type="hidden" name="lotId" value={rmLot.id} />
              <button
                type="submit"
                className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white"
              >
                Run drill on {rmLot.lotNumber}
              </button>
            </form>
          ) : null
        }
      />

      {liveBlast ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Customers at risk"
              value={String(liveBlast.customerCount)}
            />
            <Stat label="Qty shipped at risk" value={String(liveBlast.qtyAtRisk)} />
            <Stat
              label="Severity"
              value={liveBlast.severity}
              hint={`Origin ${liveBlast.originLot} · ${liveBlast.originLabel}`}
            />
          </div>

          <Card className="mb-6">
            <h2 className="font-semibold">Customers to notify</h2>
            <div className="mt-3">
              <DataTable
                headers={["Customer", "Lot", "Qty", "Invoice", "Delivered"]}
                rows={liveBlast.customersAtRisk.map((c) => [
                  c.customerName,
                  c.lotNumber,
                  String(c.qty),
                  c.invoiceNumber ?? "—",
                  c.deliveredAt,
                ])}
              />
            </div>
          </Card>
        </>
      ) : null}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Recall records
      </h2>
      <DataTable
        headers={["Created", "Lot", "Reason", "Customers", "Qty", "Status"]}
        rows={recalls.map((r) => [
          formatDate(r.createdAt),
          r.lotId.slice(-8),
          r.reason,
          String(r.customerCount),
          String(r.qtyAtRisk),
          <Badge key={r.id} tone={r.status === "open" ? "warn" : "success"}>
            {r.status}
          </Badge>,
        ])}
      />
    </AppShell>
  );
}
