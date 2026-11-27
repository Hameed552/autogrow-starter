import { AppShell } from "@/components/shell";
import { Badge, Card, DataTable, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatAed, formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function DashboardPage() {
  const workspace = await prisma.workspace.findFirst({
    include: {
      materials: true,
      products: true,
      productionBatches: { orderBy: { completedAt: "desc" }, take: 5 },
      invoices: { include: { customer: true }, orderBy: { issuedAt: "desc" }, take: 5 },
      inventoryLots: { where: { itemType: "finished_product" } },
    },
  });

  if (!workspace) {
    return (
      <AppShell active="/app">
        <PageHeader
          title="No workspace"
          subtitle="Run npm run db:seed to load the Gulf Fresh Foods demo."
        />
      </AppShell>
    );
  }

  const fgValue = workspace.inventoryLots.reduce(
    (sum, l) => sum + l.qtyRemaining * l.unitCostAed,
    0,
  );
  const openAr = workspace.invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.totalAed - i.paidAed), 0);
  const lastBatch = workspace.productionBatches[0];

  return (
    <AppShell active="/app">
      <PageHeader
        title={workspace.name}
        subtitle={`${workspace.industry} · ${workspace.emirate} · TRN ${workspace.trn}`}
        actions={<Badge tone="accent">Demo workspace</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="FG inventory value"
          value={formatAed(fgValue)}
          hint="At true batch unit cost"
        />
        <Stat
          label="Open receivables"
          value={formatAed(openAr)}
          hint="Incl. 5% VAT"
        />
        <Stat
          label="Raw materials"
          value={String(workspace.materials.length)}
          hint="With allergen tags"
        />
        <Stat
          label="Last batch unit cost"
          value={
            lastBatch ? formatAed(lastBatch.unitCostAed) : "—"
          }
          hint={lastBatch?.batchNumber}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Recent production
          </h2>
          <div className="mt-4">
            <DataTable
              headers={["Batch", "Status", "Unit cost", "Qty"]}
              rows={workspace.productionBatches.map((b) => [
                b.batchNumber,
                <Badge
                  key={b.id}
                  tone={b.status === "completed" ? "success" : "warn"}
                >
                  {b.status}
                </Badge>,
                formatAed(b.unitCostAed),
                String(b.actualQty ?? b.plannedQty),
              ])}
            />
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Recent invoices
          </h2>
          <div className="mt-4">
            <DataTable
              headers={["Invoice", "Customer", "Issued", "Total"]}
              rows={workspace.invoices.map((inv) => [
                inv.number,
                inv.customer.name,
                formatDate(inv.issuedAt),
                formatAed(inv.totalAed),
              ])}
            />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
