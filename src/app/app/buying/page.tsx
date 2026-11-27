import { AppShell } from "@/components/shell";
import { Card, DataTable, PageHeader, Stat } from "@/components/ui";
import { buildBuyingPlan } from "@/lib/buying-plan";
import { calcVat } from "@/lib/vat";
import { prisma } from "@/lib/db";
import { formatAed } from "@/lib/utils";
import { createPosFromPlan } from "./actions";

export const dynamic = "force-dynamic";

export default async function BuyingPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/buying">
        <PageHeader title="Buying plan" />
      </AppShell>
    );
  }

  const materials = await prisma.rawMaterial.findMany({
    where: { workspaceId: workspace.id },
    include: { lots: true, supplier: true },
  });

  const rows = materials.map((m) => ({
    materialId: m.id,
    materialName: m.name,
    unit: m.unit,
    minLevel: m.minLevel,
    onHand: m.lots.reduce((s, l) => s + l.qtyRemaining, 0),
    unitCostAed: m.unitCostAed,
    supplierId: m.supplierId,
    supplierName: m.supplier?.name ?? null,
  }));

  const plan = buildBuyingPlan(rows);
  const pos = await prisma.purchaseOrder.findMany({
    where: { workspaceId: workspace.id },
    include: { supplier: true, lines: true },
    orderBy: { orderedAt: "desc" },
  });

  const planTotal = plan.reduce((s, p) => s + p.subtotalAed, 0);

  return (
    <AppShell active="/app/buying">
      <PageHeader
        title="Buying plan → PO"
        subtitle="Materials below min level become one-click purchase orders per supplier."
        actions={
          plan.length > 0 ? (
            <form action={createPosFromPlan}>
              <button
                type="submit"
                className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white"
              >
                Create POs from plan
              </button>
            </form>
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="SKUs below min" value={String(rows.filter((r) => r.onHand < r.minLevel).length)} />
        <Stat label="Suggested suppliers" value={String(plan.length)} />
        <Stat
          label="Plan subtotal"
          value={formatAed(planTotal)}
          hint={`+ VAT ${formatAed(calcVat(planTotal).vatAed)}`}
        />
      </div>

      {plan.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--muted)]">
            All materials are at or above min level. Lower stock or raise mins to
            generate a plan.
          </p>
        </Card>
      ) : (
        plan.map((sug) => (
          <Card key={sug.supplierId} className="mb-4">
            <h2 className="font-semibold">{sug.supplierName}</h2>
            <p className="text-sm text-[var(--muted)]">
              Subtotal {formatAed(sug.subtotalAed)}
            </p>
            <div className="mt-3">
              <DataTable
                headers={["Material", "Order qty", "Unit", "Unit cost", "Line"]}
                rows={sug.lines.map((l) => [
                  l.materialName,
                  String(l.qtyToOrder),
                  l.unit,
                  formatAed(l.unitCostAed),
                  formatAed(l.lineTotalAed),
                ])}
              />
            </div>
          </Card>
        ))
      )}

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Purchase orders
      </h2>
      <DataTable
        headers={["PO", "Supplier", "Source", "Subtotal", "VAT", "Status"]}
        rows={pos.map((p) => [
          p.number,
          p.supplier.name,
          p.source,
          formatAed(p.subtotalAed),
          formatAed(p.vatAed),
          p.status,
        ])}
      />
    </AppShell>
  );
}
