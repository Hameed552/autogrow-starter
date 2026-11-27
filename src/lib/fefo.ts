/**
 * FEFO picking — assign earliest-expiry lots first; block if insufficient or failed QC.
 */

export type PickLot = {
  id: string;
  lotNumber: string;
  productId: string;
  qtyRemaining: number;
  expiresAt: Date | null;
  receivedAt: Date;
  qcStatus: string;
  status: string;
};

export type PickAllocation = {
  productId: string;
  qtyRequired: number;
  allocations: { lotId: string; lotNumber: string; qty: number; expiresAt: Date | null }[];
  shortfall: number;
  blockedReason?: string;
};

export function allocateFefo(params: {
  productId: string;
  qtyRequired: number;
  lots: PickLot[];
}): PickAllocation {
  const eligible = params.lots
    .filter(
      (l) =>
        l.productId === params.productId &&
        l.qtyRemaining > 0 &&
        l.status === "Active" &&
        l.qcStatus === "Passed",
    )
    .sort((a, b) => {
      if (a.expiresAt && b.expiresAt) return a.expiresAt.getTime() - b.expiresAt.getTime();
      if (a.expiresAt) return -1;
      if (b.expiresAt) return 1;
      return a.receivedAt.getTime() - b.receivedAt.getTime();
    });

  let need = params.qtyRequired;
  const allocations: PickAllocation["allocations"] = [];

  for (const lot of eligible) {
    if (need <= 0) break;
    const take = Math.min(need, lot.qtyRemaining);
    allocations.push({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      qty: take,
      expiresAt: lot.expiresAt,
    });
    need -= take;
  }

  const shortfall = Math.max(0, need);
  return {
    productId: params.productId,
    qtyRequired: params.qtyRequired,
    allocations,
    shortfall,
    blockedReason:
      shortfall > 0
        ? `Insufficient FEFO stock — short ${shortfall.toFixed(2)}`
        : undefined,
  };
}
