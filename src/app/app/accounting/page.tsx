import { AppShell } from "@/components/shell";
import { ButtonLink, Card, DataTable, PageHeader } from "@/components/ui";
import {
  expenseToJournal,
  invoiceToJournal,
  journalToCsv,
} from "@/lib/accounting-export";
import { prisma } from "@/lib/db";
import { formatAed } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const workspace = await prisma.workspace.findFirst({
    include: {
      invoices: { include: { customer: true } },
      expenses: true,
    },
  });

  if (!workspace) {
    return (
      <AppShell active="/app/accounting">
        <PageHeader title="Accounting export" />
      </AppShell>
    );
  }

  const lines = [
    ...workspace.invoices.flatMap((inv) =>
      invoiceToJournal({
        number: inv.number,
        issuedAt: inv.issuedAt,
        subtotalAed: inv.subtotalAed,
        vatAed: inv.vatAed,
        totalAed: inv.totalAed,
        customerName: inv.customer.name,
      }),
    ),
    ...workspace.expenses.flatMap((e) => expenseToJournal(e)),
  ];

  const csv = journalToCsv(lines);
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <AppShell active="/app/accounting">
      <PageHeader
        title="Accounting export"
        subtitle="Journal CSV for Xero, QuickBooks Online, or Zoho Books. Live OAuth sync is next — this closes the handoff gap today."
        actions={
          <ButtonLink href={csvHref}>Download journal CSV</ButtonLink>
        }
      />

      <Card className="mb-6">
        <h2 className="font-semibold">Integration status</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          <li>✓ Manual journal CSV (ships now)</li>
          <li>○ Xero OAuth sync — planned</li>
          <li>○ QuickBooks Online sync — planned</li>
          <li>○ Zoho Books sync — planned</li>
        </ul>
        <p className="mt-3 text-sm text-[var(--ink)]">
          Honest claim: export works. Live two-way sync is not claimed until
          credentials and partner apps are connected.
        </p>
      </Card>

      <DataTable
        headers={[
          "Date",
          "Ref",
          "Account",
          "Description",
          "Debit",
          "Credit",
          "Tax",
        ]}
        rows={lines.map((l, i) => [
          l.date,
          l.reference,
          `${l.accountCode} ${l.accountName}`,
          l.description,
          l.debitAed ? formatAed(l.debitAed) : "—",
          l.creditAed ? formatAed(l.creditAed) : "—",
          l.taxCode ?? "—",
        ])}
      />
    </AppShell>
  );
}
