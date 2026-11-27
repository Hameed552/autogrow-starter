/** Cost variance: standard (BOM × material standard) vs actual batch unit cost. */

export type VarianceLine = {
  batchNumber: string;
  productName: string;
  plannedQty: number;
  standardUnitCostAed: number;
  actualUnitCostAed: number;
  varianceAed: number;
  variancePct: number;
  status: "favorable" | "unfavorable" | "on_target";
};

export function computeStandardUnitCost(params: {
  presetOutputQty: number;
  bomLines: { quantity: number; unitCostAed: number }[];
  laborCostAed?: number;
  overheadCostAed?: number;
}) {
  const material = params.bomLines.reduce(
    (s, l) => s + l.quantity * l.unitCostAed,
    0,
  );
  const total =
    material + (params.laborCostAed ?? 0) + (params.overheadCostAed ?? 0);
  return params.presetOutputQty > 0 ? total / params.presetOutputQty : 0;
}

export function varianceForBatch(params: {
  batchNumber: string;
  productName: string;
  plannedQty: number;
  standardUnitCostAed: number;
  actualUnitCostAed: number;
  tolerancePct?: number;
}): VarianceLine {
  const varianceAed =
    Math.round((params.actualUnitCostAed - params.standardUnitCostAed) * 10000) /
    10000;
  const variancePct =
    params.standardUnitCostAed > 0
      ? (varianceAed / params.standardUnitCostAed) * 100
      : 0;
  const tol = params.tolerancePct ?? 2;
  let status: VarianceLine["status"] = "on_target";
  if (variancePct > tol) status = "unfavorable";
  else if (variancePct < -tol) status = "favorable";

  return {
    batchNumber: params.batchNumber,
    productName: params.productName,
    plannedQty: params.plannedQty,
    standardUnitCostAed: round4(params.standardUnitCostAed),
    actualUnitCostAed: round4(params.actualUnitCostAed),
    varianceAed: round4(varianceAed),
    variancePct: Math.round(variancePct * 100) / 100,
    status,
  };
}

function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}
