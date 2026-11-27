import { AppShell } from "@/components/shell";
import { Badge, DataTable, PageHeader, Stat } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatAed, formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";


export default async function SalesPage() {
  const workspace = await prisma.workspace.findFirst({
    include: {
      invoices: { include: { customer: true }, orderBy: { issuedAt: "desc" } },
      salesOrders: { include: { customer: true }, orderBy: { orderedAt: "desc" } },
    },
  });

  if (!workspace) {
    return (
      <AppShell active="/app/sales">
        <PageHeader title="Sales & VAT" />
      </AppShell>
    );
  }

  const vatCollected = workspace.invoices.reduce((s, i) => s + i.vatAed, 0);
  const revenue = workspace.invoices.reduce((s, i) => s + i.subtotalAed, 0);

  return (
    <AppShell active="/app/sales">
      <PageHeader
        title="Sales & UAE VAT"
        subtitle="Invoices carry TRN, emirate, 5% VAT split, and FTA-ready totals."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Net sales" value={formatAed(revenue)} />
        <Stat label="VAT collected (5%)" value={formatAed(vatCollected)} />
        <Stat
          label="Seller TRN"
          value={workspace.trn ?? "—"}
          hint={workspace.emirate ?? undefined}
        />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Invoices
      </h2>
      <DataTable
        headers={[
          "Number",
          "Customer",
          "Emirate",
          "Subtotal",
          "VAT",
          "Total",
          "Status",
        ]}
        rows={workspace.invoices.map((inv) => [
          inv.number,
          inv.customer.name,
          inv.emirate,
          formatAed(inv.subtotalAed),
          formatAed(inv.vatAed),
          formatAed(inv.totalAed),
          <Badge key={inv.id} tone={inv.status === "paid" ? "success" : "accent"}>
            {inv.status}
          </Badge>,
        ])}
      />

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
        Sales orders
      </h2>
      <DataTable
        headers={["SO", "Customer", "Ordered", "Subtotal", "Status"]}
        rows={workspace.salesOrders.map((so) => [
          so.number,
          so.customer.name,
          formatDate(so.orderedAt),
          formatAed(so.subtotalAed),
          so.status,
        ])}
      />
    </AppShell>
  );
}
