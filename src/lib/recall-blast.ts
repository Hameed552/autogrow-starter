/**
 * Recall blast radius — given an RM or FG lot, compute affected batches, FG lots, customers.
 */

export type BlastInput = {
  lotId: string;
  lotNumber: string;
  itemType: string;
  productName?: string | null;
  materialName?: string | null;
  consumptions: {
    batchId: string;
    batchNumber: string;
    productName: string;
    outputLotId: string | null;
    qtyUsed: number;
  }[];
  deliveries: {
    lotId: string;
    lotNumber: string;
    customerName: string;
    qty: number;
    invoiceNumber?: string | null;
    deliveredAt: Date;
  }[];
  fgLotsFromBatches: {
    lotId: string;
    lotNumber: string;
    batchId: string;
    qtyRemaining: number;
    qtyInitial: number;
  }[];
};

export type BlastReport = {
  originLot: string;
  originLabel: string;
  affectedBatches: { batchNumber: string; productName: string; qtyUsed: number }[];
  affectedFgLots: { lotNumber: string; qtyInitial: number; qtyRemaining: number }[];
  customersAtRisk: {
    customerName: string;
    qty: number;
    lotNumber: string;
    invoiceNumber?: string | null;
    deliveredAt: string;
  }[];
  qtyAtRisk: number;
  customerCount: number;
  severity: "low" | "medium" | "high";
};

export function computeBlast(input: BlastInput): BlastReport {
  const originLabel =
    input.materialName ?? input.productName ?? input.lotNumber;

  const affectedBatches = input.consumptions.map((c) => ({
    batchNumber: c.batchNumber,
    productName: c.productName,
    qtyUsed: c.qtyUsed,
  }));

  const fgIds = new Set(
    input.consumptions.map((c) => c.outputLotId).filter(Boolean) as string[],
  );
  if (input.itemType === "finished_product") fgIds.add(input.lotId);

  const affectedFgLots = input.fgLotsFromBatches
    .filter((f) => fgIds.has(f.lotId) || (input.itemType === "finished_product" && f.lotId === input.lotId))
    .map((f) => ({
      lotNumber: f.lotNumber,
      qtyInitial: f.qtyInitial,
      qtyRemaining: f.qtyRemaining,
    }));

  // Dedupe FG lots by number
  const seenFg = new Set<string>();
  const uniqueFg = affectedFgLots.filter((f) => {
    if (seenFg.has(f.lotNumber)) return false;
    seenFg.add(f.lotNumber);
    return true;
  });

  const relevantDeliveries = input.deliveries.filter((d) =>
    fgIds.has(d.lotId) ||
    (input.itemType === "finished_product" && d.lotId === input.lotId),
  );

  const customersAtRisk = relevantDeliveries.map((d) => ({
    customerName: d.customerName,
    qty: d.qty,
    lotNumber: d.lotNumber,
    invoiceNumber: d.invoiceNumber,
    deliveredAt: d.deliveredAt.toISOString().slice(0, 10),
  }));

  const qtyAtRisk = customersAtRisk.reduce((s, c) => s + c.qty, 0);
  const customerCount = new Set(customersAtRisk.map((c) => c.customerName)).size;

  let severity: BlastReport["severity"] = "low";
  if (customerCount >= 3 || qtyAtRisk >= 100) severity = "high";
  else if (customerCount >= 1 || qtyAtRisk > 0) severity = "medium";

  return {
    originLot: input.lotNumber,
    originLabel,
    affectedBatches,
    affectedFgLots: uniqueFg,
    customersAtRisk,
    qtyAtRisk,
    customerCount,
    severity,
  };
}
