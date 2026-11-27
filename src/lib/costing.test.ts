import { computeBatchCost } from "./costing";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const now = new Date();

const result = computeBatchCost({
  presetOutputQty: 100,
  plannedQty: 200,
  bomLines: [
    {
      materialId: "m1",
      materialName: "Flour",
      quantity: 25,
      unitCostFallback: 3.2,
    },
    {
      materialId: "m2",
      materialName: "Yeast",
      quantity: 0.4,
      unitCostFallback: 28,
    },
  ],
  lots: [
    {
      id: "l1",
      lotNumber: "A",
      materialId: "m1",
      qtyRemaining: 40,
      unitCostAed: 3.0,
      receivedAt: new Date(now.getTime() - 86400000 * 10),
      expiresAt: new Date(now.getTime() + 86400000 * 30),
    },
    {
      id: "l2",
      lotNumber: "B",
      materialId: "m1",
      qtyRemaining: 100,
      unitCostAed: 3.5,
      receivedAt: new Date(now.getTime() - 86400000 * 2),
      expiresAt: new Date(now.getTime() + 86400000 * 60),
    },
    {
      id: "l3",
      lotNumber: "Y",
      materialId: "m2",
      qtyRemaining: 5,
      unitCostAed: 27,
      receivedAt: now,
      expiresAt: null,
    },
  ],
  laborCostAed: 100,
  overheadCostAed: 20,
});

assert(result.unitCostAed > 0, "unit cost must be > 0");
assert(result.materialCostAed > 0, "material cost must be > 0");
// 200 packs => 50kg flour: 40@3 + 10@3.5 = 155; yeast 0.8@27 = 21.6; +120 = 296.6; unit = 1.483
assert(
  Math.abs(result.materialCostAed - 176.6) < 0.01,
  `unexpected material cost ${result.materialCostAed}`,
);
assert(
  Math.abs(result.unitCostAed - 1.483) < 0.001,
  `unexpected unit cost ${result.unitCostAed}`,
);
assert(result.insufficient.length === 0, "should have enough stock");

console.log("costing.test.ts passed", {
  unitCostAed: result.unitCostAed,
  materialCostAed: result.materialCostAed,
});
