import { AppShell } from "@/components/shell";
import { Card, DataTable, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function TraceabilityPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/traceability">
        <PageHeader title="Traceability" />
      </AppShell>
    );
  }

  const batches = await prisma.productionBatch.findMany({
    where: { workspaceId: workspace.id, status: "completed" },
    include: {
      product: true,
      consumptions: {
        include: { lot: { include: { material: true } } },
      },
    },
  });

  const deliveries = await prisma.lotDelivery.findMany({
    where: { lot: { workspaceId: workspace.id } },
    include: {
      lot: { include: { product: true } },
      invoice: true,
    },
    orderBy: { deliveredAt: "desc" },
  });

  return (
    <AppShell active="/app/traceability">
      <PageHeader
        title="Lot traceability & recall"
        subtitle="Forward: which customers received an FG lot. Backward: which RM lots went into a batch."
      />

      <div className="space-y-8">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <h2 className="font-semibold text-[var(--ink)]">
              {batch.batchNumber} → {batch.product.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Completed{" "}
              {batch.completedAt ? formatDate(batch.completedAt) : "—"} · FG lot{" "}
              {batch.outputLotId ? "linked" : "pending"}
            </p>
            <div className="mt-4">
              <DataTable
                headers={["RM lot", "Material", "Supplier lot", "Qty used"]}
                rows={batch.consumptions.map((c) => [
                  c.lot.lotNumber,
                  c.lot.material?.name ?? "—",
                  c.lot.supplierLot ?? "—",
                  String(c.qtyUsed),
                ])}
              />
            </div>
          </Card>
        ))}

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Forward trace (deliveries)
          </h2>
          <DataTable
            headers={["FG lot", "Product", "Customer", "Qty", "Invoice", "Date"]}
            rows={deliveries.map((d) => [
              d.lot.lotNumber,
              d.lot.product?.name ?? "—",
              d.customerName,
              String(d.qty),
              d.invoice?.number ?? "—",
              formatDate(d.deliveredAt),
            ])}
          />
        </div>
      </div>
    </AppShell>
  );
}
