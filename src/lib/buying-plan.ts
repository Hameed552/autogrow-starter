/** Buying plan — materials below min level → suggested PO lines grouped by supplier. */

export type StockRow = {
  materialId: string;
  materialName: string;
  unit: string;
  minLevel: number;
  onHand: number;
  unitCostAed: number;
  supplierId: string | null;
  supplierName: string | null;
};

export type BuyingSuggestion = {
  supplierId: string;
  supplierName: string;
  lines: {
    materialId: string;
    materialName: string;
    unit: string;
    qtyToOrder: number;
    unitCostAed: number;
    lineTotalAed: number;
  }[];
  subtotalAed: number;
};

export function buildBuyingPlan(rows: StockRow[]): BuyingSuggestion[] {
  const need = rows.filter((r) => r.onHand < r.minLevel && r.supplierId);
  const bySupplier = new Map<string, BuyingSuggestion>();

  for (const r of need) {
    const qtyToOrder = Math.max(r.minLevel * 2 - r.onHand, r.minLevel - r.onHand);
    const rounded = Math.ceil(qtyToOrder * 100) / 100;
    const lineTotalAed = Math.round(rounded * r.unitCostAed * 100) / 100;
    const key = r.supplierId!;
    if (!bySupplier.has(key)) {
      bySupplier.set(key, {
        supplierId: key,
        supplierName: r.supplierName ?? "Supplier",
        lines: [],
        subtotalAed: 0,
      });
    }
    const sug = bySupplier.get(key)!;
    sug.lines.push({
      materialId: r.materialId,
      materialName: r.materialName,
      unit: r.unit,
      qtyToOrder: rounded,
      unitCostAed: r.unitCostAed,
      lineTotalAed,
    });
    sug.subtotalAed = Math.round((sug.subtotalAed + lineTotalAed) * 100) / 100;
  }

  return [...bySupplier.values()];
}
