import { AppShell } from "@/components/shell";
import { Badge, Card, DataTable, PageHeader } from "@/components/ui";
import { computeBatchCost } from "@/lib/costing";
import { prisma } from "@/lib/db";
import { formatAed, formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function ProductionPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/production">
        <PageHeader title="Production" />
      </AppShell>
    );
  }

  const batches = await prisma.productionBatch.findMany({
    where: { workspaceId: workspace.id },
    include: {
      product: true,
      preset: { include: { lines: { include: { material: true } } } },
      consumptions: { include: { lot: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  const preset = await prisma.bomPreset.findFirst({
    where: { workspaceId: workspace.id },
    include: { lines: { include: { material: true } }, product: true },
  });

  const lots = await prisma.inventoryLot.findMany({
    where: { workspaceId: workspace.id, itemType: "raw_material" },
  });

  let preview = null;
  if (preset) {
    preview = computeBatchCost({
      presetOutputQty: preset.outputQty,
      plannedQty: 100,
      bomLines: preset.lines.map((l) => ({
        materialId: l.materialId,
        materialName: l.material.name,
        quantity: l.quantity,
        unitCostFallback: l.material.unitCostAed,
      })),
      lots: lots
        .filter((l) => l.materialId)
        .map((l) => ({
          id: l.id,
          lotNumber: l.lotNumber,
          materialId: l.materialId!,
          qtyRemaining: l.qtyRemaining,
          unitCostAed: l.unitCostAed,
          receivedAt: l.receivedAt,
          expiresAt: l.expiresAt,
        })),
      laborCostAed: 90,
      overheadCostAed: 22,
    });
  }

  return (
    <AppShell active="/app/production">
      <PageHeader
        title="Production & costing"
        subtitle="Every completed batch writes a non-zero FG unit cost from FEFO lot allocations."
      />

      {preview ? (
        <Card className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-[var(--ink)]">
                Cost preview · {preset?.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Planned 100 {preset?.product.unit} — live FEFO allocation
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Unit cost
              </p>
              <p className="text-2xl font-semibold text-[var(--accent)]">
                {formatAed(preview.unitCostAed)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[var(--muted)]">Materials</p>
              <p className="font-medium">{formatAed(preview.materialCostAed)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Labor</p>
              <p className="font-medium">{formatAed(preview.laborCostAed)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Overhead</p>
              <p className="font-medium">{formatAed(preview.overheadCostAed)}</p>
            </div>
          </div>
          {preview.insufficient.length > 0 ? (
            <p className="mt-3 text-sm text-amber-800">
              Stock warnings: {preview.insufficient.join("; ")}
            </p>
          ) : (
            <p className="mt-3 text-sm text-emerald-800">
              Sufficient lot stock for this preview.
            </p>
          )}
        </Card>
      ) : null}

      <DataTable
        headers={["Batch", "Product", "Status", "Completed", "Unit cost", "Lots used"]}
        rows={batches.map((b) => [
          b.batchNumber,
          b.product.name,
          <Badge key={b.id} tone={b.status === "completed" ? "success" : "warn"}>
            {b.status}
          </Badge>,
          b.completedAt ? formatDate(b.completedAt) : "—",
          <span key={`c-${b.id}`} className="font-semibold text-[var(--accent)]">
            {formatAed(b.unitCostAed)}
          </span>,
          String(b.consumptions.length),
        ])}
      />
    </AppShell>
  );
}
