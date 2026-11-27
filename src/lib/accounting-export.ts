/**
 * Accounting export path — CSV / journal lines for Xero / QuickBooks Online / Zoho Books.
 * Live OAuth sync is the next integration step; this closes the "no accounting path" gap.
 */

export type JournalLine = {
  accountCode: string;
  accountName: string;
  description: string;
  debitAed: number;
  creditAed: number;
  taxCode?: string;
  date: string;
  reference: string;
};

export function invoiceToJournal(invoice: {
  number: string;
  issuedAt: Date | string;
  subtotalAed: number;
  vatAed: number;
  totalAed: number;
  customerName: string;
}): JournalLine[] {
  const date =
    typeof invoice.issuedAt === "string"
      ? invoice.issuedAt.slice(0, 10)
      : invoice.issuedAt.toISOString().slice(0, 10);
  const ref = invoice.number;
  const desc = `Sales invoice ${ref} — ${invoice.customerName}`;

  return [
    {
      accountCode: "1100",
      accountName: "Accounts Receivable",
      description: desc,
      debitAed: invoice.totalAed,
      creditAed: 0,
      date,
      reference: ref,
    },
    {
      accountCode: "4000",
      accountName: "Sales Revenue",
      description: desc,
      debitAed: 0,
      creditAed: invoice.subtotalAed,
      date,
      reference: ref,
    },
    {
      accountCode: "2200",
      accountName: "VAT Payable (FTA)",
      description: desc,
      debitAed: 0,
      creditAed: invoice.vatAed,
      taxCode: "VAT5",
      date,
      reference: ref,
    },
  ];
}

export function expenseToJournal(expense: {
  id: string;
  category: string;
  description: string;
  amountAed: number;
  vatAed: number;
  spentAt: Date | string;
}): JournalLine[] {
  const date =
    typeof expense.spentAt === "string"
      ? expense.spentAt.slice(0, 10)
      : expense.spentAt.toISOString().slice(0, 10);
  const ref = `EXP-${expense.id.slice(-6)}`;
  const total = expense.amountAed + expense.vatAed;

  return [
    {
      accountCode: mapExpenseAccount(expense.category),
      accountName: expense.category,
      description: expense.description,
      debitAed: expense.amountAed,
      creditAed: 0,
      date,
      reference: ref,
    },
    ...(expense.vatAed > 0
      ? [
          {
            accountCode: "2100",
            accountName: "VAT Receivable (Input)",
            description: expense.description,
            debitAed: expense.vatAed,
            creditAed: 0,
            taxCode: "VAT5",
            date,
            reference: ref,
          } satisfies JournalLine,
        ]
      : []),
    {
      accountCode: "1000",
      accountName: "Bank / Cash",
      description: expense.description,
      debitAed: 0,
      creditAed: total,
      date,
      reference: ref,
    },
  ];
}

function mapExpenseAccount(category: string): string {
  const map: Record<string, string> = {
    Rent: "5100",
    Utilities: "5200",
    Labor: "5300",
    Packaging: "5400",
    Logistics: "5500",
    Marketing: "5600",
    Other: "5900",
  };
  return map[category] ?? "5900";
}

export function journalToCsv(lines: JournalLine[]): string {
  const header = [
    "Date",
    "Reference",
    "Account Code",
    "Account Name",
    "Description",
    "Debit AED",
    "Credit AED",
    "Tax Code",
  ].join(",");
  const rows = lines.map((l) =>
    [
      l.date,
      l.reference,
      l.accountCode,
      csvEscape(l.accountName),
      csvEscape(l.description),
      l.debitAed.toFixed(2),
      l.creditAed.toFixed(2),
      l.taxCode ?? "",
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
