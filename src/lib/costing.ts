/**
 * IronSight costing engine — FIFO lot consumption with real unit costs.
 * Fixes the live Base44 bug where finished-goods unit cost stayed 0.00.
 */

export type CostLine = {
  materialId: string;
  materialName: string;
  qtyRequired: number;
  unitCostAed: number;
  lineCostAed: number;
  lotAllocations: { lotId: string; lotNumber: string; qty: number; unitCostAed: number }[];
};

export type CostBreakdown = {
  materialCostAed: number;
  laborCostAed: number;
  overheadCostAed: number;
  totalCostAed: number;
  unitCostAed: number;
  outputQty: number;
  lines: CostLine[];
  insufficient: string[];
};

export type LotCandidate = {
  id: string;
  lotNumber: string;
  materialId: string;
  qtyRemaining: number;
  unitCostAed: number;
  receivedAt: Date;
  expiresAt: Date | null;
};

export type BomInputLine = {
  materialId: string;
  materialName: string;
  quantity: number; // per preset output
  unitCostFallback: number;
};

/**
 * Scale BOM to planned qty and allocate FIFO lots.
 * Labor/overhead are optional AED inputs (not invented).
 */
export function computeBatchCost(params: {
  presetOutputQty: number;
  plannedQty: number;
  bomLines: BomInputLine[];
  lots: LotCandidate[];
  laborCostAed?: number;
  overheadCostAed?: number;
}): CostBreakdown {
  const scale = params.plannedQty / params.presetOutputQty;
  const lines: CostLine[] = [];
  const insufficient: string[] = [];
  let materialCostAed = 0;

  // Clone remaining so we can allocate across materials without mutating caller
  const remainingByLot = new Map(params.lots.map((l) => [l.id, l.qtyRemaining]));

  for (const bom of params.bomLines) {
    const qtyRequired = bom.quantity * scale;
    const candidates = params.lots
      .filter((l) => l.materialId === bom.materialId && (remainingByLot.get(l.id) ?? 0) > 0)
      .sort((a, b) => {
        // FEFO if expiry exists, else FIFO by receivedAt
        if (a.expiresAt && b.expiresAt) return a.expiresAt.getTime() - b.expiresAt.getTime();
        if (a.expiresAt) return -1;
        if (b.expiresAt) return 1;
        return a.receivedAt.getTime() - b.receivedAt.getTime();
      });

    let need = qtyRequired;
    const lotAllocations: CostLine["lotAllocations"] = [];
    let lineCost = 0;

    for (const lot of candidates) {
      if (need <= 0) break;
      const avail = remainingByLot.get(lot.id) ?? 0;
      if (avail <= 0) continue;
      const take = Math.min(need, avail);
      lotAllocations.push({
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        qty: take,
        unitCostAed: lot.unitCostAed,
      });
      lineCost += take * lot.unitCostAed;
      remainingByLot.set(lot.id, avail - take);
      need -= take;
    }

    if (need > 0.0001) {
      // Fall back to standard cost for shortfall (still flags insufficient stock)
      lineCost += need * bom.unitCostFallback;
      insufficient.push(
        `${bom.materialName}: short ${need.toFixed(3)} (using standard cost ${bom.unitCostFallback.toFixed(2)} AED)`,
      );
    }

    const weightedUnit =
      qtyRequired > 0 ? lineCost / qtyRequired : bom.unitCostFallback;

    lines.push({
      materialId: bom.materialId,
      materialName: bom.materialName,
      qtyRequired,
      unitCostAed: weightedUnit,
      lineCostAed: Math.round(lineCost * 100) / 100,
      lotAllocations,
    });
    materialCostAed += lineCost;
  }

  const laborCostAed = params.laborCostAed ?? 0;
  const overheadCostAed = params.overheadCostAed ?? 0;
  const totalCostAed = materialCostAed + laborCostAed + overheadCostAed;
  const unitCostAed =
    params.plannedQty > 0 ? totalCostAed / params.plannedQty : 0;

  return {
    materialCostAed: Math.round(materialCostAed * 100) / 100,
    laborCostAed: Math.round(laborCostAed * 100) / 100,
    overheadCostAed: Math.round(overheadCostAed * 100) / 100,
    totalCostAed: Math.round(totalCostAed * 100) / 100,
    unitCostAed: Math.round(unitCostAed * 10000) / 10000,
    outputQty: params.plannedQty,
    lines,
    insufficient,
  };
}

/** Traceability: which raw lots went into a finished lot / batch. */
export function flattenTraceability(lines: CostLine[]) {
  return lines.flatMap((line) =>
    line.lotAllocations.map((a) => ({
      materialId: line.materialId,
      materialName: line.materialName,
      ...a,
    })),
  );
}
