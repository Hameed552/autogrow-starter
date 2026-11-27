import { AppShell } from "@/components/shell";
import { Badge, DataTable, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatAed, formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function InventoryPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/inventory">
        <PageHeader title="Inventory" subtitle="Seed the demo first." />
      </AppShell>
    );
  }

  const lots = await prisma.inventoryLot.findMany({
    where: { workspaceId: workspace.id },
    include: { material: true, product: true },
    orderBy: { receivedAt: "desc" },
  });

  const materials = await prisma.rawMaterial.findMany({
    where: { workspaceId: workspace.id },
    include: { lots: true },
  });

  const lowStock = materials.filter((m) => {
    const onHand = m.lots.reduce((s, l) => s + l.qtyRemaining, 0);
    return onHand < m.minLevel;
  });

  const fgLots = lots.filter((l) => l.itemType === "finished_product");
  const zeroCostBug = fgLots.filter((l) => l.unitCostAed <= 0);

  return (
    <AppShell active="/app/inventory">
      <PageHeader
        title="Inventory & lots"
        subtitle="FEFO-aware lots with real unit costs — finished goods never post at 0.00."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Active lots" value={String(lots.length)} />
        <Stat
          label="Low-stock SKUs"
          value={String(lowStock.length)}
          hint={lowStock.map((m) => m.name).join(", ") || "All above min"}
        />
        <Stat
          label="FG zero-cost bugs"
          value={String(zeroCostBug.length)}
          hint={
            zeroCostBug.length === 0
              ? "Costing engine healthy"
              : "Investigate batch costing"
          }
        />
      </div>

      <DataTable
        headers={[
          "Lot",
          "Item",
          "Type",
          "On hand",
          "Unit cost",
          "Expires",
          "QC",
        ]}
        rows={lots.map((lot) => [
          lot.lotNumber,
          lot.material?.name ?? lot.product?.name ?? "—",
          <Badge key={lot.id} tone={lot.itemType === "finished_product" ? "accent" : "neutral"}>
            {lot.itemType === "finished_product" ? "FG" : "RM"}
          </Badge>,
          `${lot.qtyRemaining} / ${lot.qtyInitial}`,
          formatAed(lot.unitCostAed),
          lot.expiresAt ? formatDate(lot.expiresAt) : "—",
          lot.qcStatus,
        ])}
      />
    </AppShell>
  );
}
