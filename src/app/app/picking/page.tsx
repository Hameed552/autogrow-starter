import { AppShell } from "@/components/shell";
import { Badge, Card, DataTable, PageHeader, Stat } from "@/components/ui";
import { allocateFefo } from "@/lib/fefo";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { createFefoPick } from "./actions";

export const dynamic = "force-dynamic";

export default async function PickingPage() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    return (
      <AppShell active="/app/picking">
        <PageHeader title="FEFO picking" />
      </AppShell>
    );
  }

  const product = await prisma.finishedProduct.findFirst({
    where: { workspaceId: workspace.id },
  });
  const lots = await prisma.inventoryLot.findMany({
    where: {
      workspaceId: workspace.id,
      itemType: "finished_product",
      productId: product?.id,
    },
  });
  const picks = await prisma.pickOrder.findMany({
    where: { workspaceId: workspace.id },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });

  const preview = product
    ? allocateFefo({
        productId: product.id,
        qtyRequired: 30,
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
      })
    : null;

  return (
    <AppShell active="/app/picking">
      <PageHeader
        title="FEFO picking"
        subtitle="Outbound picks must consume earliest-expiry lots. Shortfalls block fulfillment."
        actions={
          <form action={createFefoPick}>
            <input type="hidden" name="qty" value="30" />
            <button
              type="submit"
              className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-medium text-white"
            >
              Create pick (30 packs)
            </button>
          </form>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Preview shortfall"
          value={preview ? String(preview.shortfall) : "—"}
          hint={preview?.blockedReason ?? "FEFO allocation ok"}
        />
        <Stat label="Open picks" value={String(picks.filter((p) => p.status !== "fulfilled").length)} />
        <Stat label="FG lots available" value={String(lots.filter((l) => l.qtyRemaining > 0).length)} />
      </div>

      {preview ? (
        <Card className="mb-6">
          <h2 className="font-semibold">Allocation preview · 30 packs</h2>
          <div className="mt-3">
            <DataTable
              headers={["Lot", "Qty", "Expires"]}
              rows={preview.allocations.map((a) => [
                a.lotNumber,
                String(a.qty),
                a.expiresAt ? formatDate(a.expiresAt) : "—",
              ])}
            />
          </div>
        </Card>
      ) : null}

      <DataTable
        headers={["Pick #", "Status", "Lines", "Created"]}
        rows={picks.map((p) => [
          p.number,
          <Badge
            key={p.id}
            tone={
              p.status === "blocked"
                ? "warn"
                : p.status === "fulfilled"
                  ? "success"
                  : "accent"
            }
          >
            {p.status}
          </Badge>,
          String(p.lines.length),
          formatDate(p.createdAt),
        ])}
      />
    </AppShell>
  );
}
