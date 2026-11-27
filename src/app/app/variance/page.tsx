import { AppShell } from "@/components/shell";
import { Badge, DataTable, PageHeader, Stat } from "@/components/ui";
import {
  computeStandardUnitCost,
  varianceForBatch,
} from "@/lib/cost-variance";
import { prisma } from "@/lib/db";
import { formatAed } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VariancePage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/variance">
        <PageHeader title="Cost variance" />
      </AppShell>
    );
  }

  const batches = await prisma.productionBatch.findMany({
    where: { workspaceId: workspace.id, status: "completed" },
    include: {
      product: true,
      preset: { include: { lines: { include: { material: true } } } },
    },
  });

  const rows = batches.map((b) => {
    const stdPerUnit = b.preset
      ? computeStandardUnitCost({
          presetOutputQty: b.preset.outputQty,
          bomLines: b.preset.lines.map((l) => ({
            quantity: l.quantity,
            unitCostAed: l.material.unitCostAed,
          })),
          laborCostAed: 90,
          overheadCostAed: 22,
        })
      : b.unitCostAed;

    return varianceForBatch({
      batchNumber: b.batchNumber,
      productName: b.product.name,
      plannedQty: b.plannedQty,
      standardUnitCostAed: stdPerUnit,
      actualUnitCostAed: b.unitCostAed,
    });
  });

  const unfavorable = rows.filter((r) => r.status === "unfavorable").length;
  const avgVar =
    rows.length > 0
      ? rows.reduce((s, r) => s + r.variancePct, 0) / rows.length
      : 0;

  return (
    <AppShell active="/app/variance">
      <PageHeader
        title="Cost variance"
        subtitle="Standard BOM cost vs actual FEFO batch unit cost — catch silent margin leaks."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Completed batches" value={String(rows.length)} />
        <Stat label="Unfavorable" value={String(unfavorable)} />
        <Stat
          label="Avg variance"
          value={`${avgVar.toFixed(1)}%`}
          hint="vs standard"
        />
      </div>

      <DataTable
        headers={[
          "Batch",
          "Product",
          "Standard",
          "Actual",
          "Variance",
          "%",
          "Status",
        ]}
        rows={rows.map((r) => [
          r.batchNumber,
          r.productName,
          formatAed(r.standardUnitCostAed),
          formatAed(r.actualUnitCostAed),
          formatAed(r.varianceAed),
          `${r.variancePct.toFixed(2)}%`,
          <Badge
            key={r.batchNumber}
            tone={
              r.status === "unfavorable"
                ? "warn"
                : r.status === "favorable"
                  ? "success"
                  : "neutral"
            }
          >
            {r.status}
          </Badge>,
        ])}
      />
    </AppShell>
  );
}
