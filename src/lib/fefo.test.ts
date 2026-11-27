import { allocateFefo } from "./fefo";
import { computeBlast } from "./recall-blast";
import { varianceForBatch, computeStandardUnitCost } from "./cost-variance";
import { buildBuyingPlan } from "./buying-plan";
import { generateTotpSecret, verifyTotp, otpauthUrl } from "./totp";
import { createHmac } from "crypto";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const now = new Date();

// FEFO: earliest expiry first
{
  const result = allocateFefo({
    productId: "p1",
    qtyRequired: 50,
    lots: [
      {
        id: "late",
        lotNumber: "FG-LATE",
        productId: "p1",
        qtyRemaining: 100,
        expiresAt: new Date(now.getTime() + 10 * 86400000),
        receivedAt: now,
        qcStatus: "Passed",
        status: "Active",
      },
      {
        id: "early",
        lotNumber: "FG-EARLY",
        productId: "p1",
        qtyRemaining: 40,
        expiresAt: new Date(now.getTime() + 2 * 86400000),
        receivedAt: now,
        qcStatus: "Passed",
        status: "Active",
      },
    ],
  });
  assert(result.allocations[0].lotNumber === "FG-EARLY", "FEFO must pick earliest expiry");
  assert(result.allocations[0].qty === 40, "take full early lot");
  assert(result.allocations[1].lotNumber === "FG-LATE", "then next");
  assert(result.shortfall === 0, "no shortfall");
}

// Recall blast
{
  const blast = computeBlast({
    lotId: "rm1",
    lotNumber: "LOT-FL-2401",
    itemType: "raw_material",
    materialName: "Flour",
    consumptions: [
      {
        batchId: "b1",
        batchNumber: "BATCH-1",
        productName: "Flatbread",
        outputLotId: "fg1",
        qtyUsed: 50,
      },
    ],
    deliveries: [
      {
        lotId: "fg1",
        lotNumber: "FG-1",
        customerName: "Spinneys",
        qty: 40,
        invoiceNumber: "INV-1",
        deliveredAt: now,
      },
    ],
    fgLotsFromBatches: [
      { lotId: "fg1", lotNumber: "FG-1", batchId: "b1", qtyRemaining: 160, qtyInitial: 200 },
    ],
  });
  assert(blast.customerCount === 1, "one customer");
  assert(blast.qtyAtRisk === 40, "qty at risk");
  assert(blast.severity === "medium", "medium severity");
}

// Cost variance
{
  const std = computeStandardUnitCost({
    presetOutputQty: 100,
    bomLines: [{ quantity: 25, unitCostAed: 3.2 }],
    laborCostAed: 90,
    overheadCostAed: 22,
  });
  const v = varianceForBatch({
    batchNumber: "B1",
    productName: "Flatbread",
    plannedQty: 200,
    standardUnitCostAed: std,
    actualUnitCostAed: std * 1.1,
  });
  assert(v.status === "unfavorable", "10% over is unfavorable");
}

// Buying plan
{
  const plan = buildBuyingPlan([
    {
      materialId: "m1",
      materialName: "Flour",
      unit: "kg",
      minLevel: 100,
      onHand: 40,
      unitCostAed: 3,
      supplierId: "s1",
      supplierName: "Agro",
    },
  ]);
  assert(plan.length === 1, "one supplier");
  assert(plan[0].lines[0].qtyToOrder >= 60, "order enough to refill");
}

// TOTP round-trip (generate code same way as verify)
{
  const secret = generateTotpSecret();
  assert(secret.length >= 16, "secret length");
  const url = otpauthUrl({ secret, email: "demo@ironsight.ae" });
  assert(url.startsWith("otpauth://totp/"), "otpauth url");

  // Produce a valid code for current window using same algorithm path
  const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  function decode(input: string) {
    let bits = 0, value = 0;
    const out: number[] = [];
    for (const ch of input) {
      const idx = BASE32.indexOf(ch);
      if (idx < 0) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return Buffer.from(out);
  }
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", decode(secret)).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = String(bin % 1_000_000).padStart(6, "0");
  assert(verifyTotp(secret, code), "totp verifies");
}

console.log("fefo/recall/variance/buying/totp tests passed");
