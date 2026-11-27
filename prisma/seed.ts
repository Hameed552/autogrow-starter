import { PrismaClient } from "@prisma/client";
import { computeBatchCost } from "../src/lib/costing";
import { calcVat } from "../src/lib/vat";

const prisma = new PrismaClient();

async function main() {
  await prisma.lotDelivery.deleteMany();
  await prisma.lotConsumption.deleteMany();
  await prisma.recall.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.productionBatch.deleteMany();
  await prisma.inventoryLot.deleteMany();
  await prisma.bomLine.deleteMany();
  await prisma.bomPreset.deleteMany();
  await prisma.finishedProduct.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: {
      name: "Gulf Fresh Foods LLC",
      industry: "Food & Beverage",
      currency: "AED",
      timezone: "Asia/Dubai",
      address: "Al Quoz Industrial Area 3, Dubai, UAE",
      phone: "+971 4 555 0100",
      trn: "100312345600003",
      emirate: "Dubai",
      locale: "en",
      users: {
        create: {
          email: "demo@ironsight.ae",
          name: "Sara Al Maktoum",
          role: "owner",
        },
      },
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      workspaceId: workspace.id,
      name: "Emirates Agro Supply",
      trn: "100298765400003",
      email: "orders@emiratesagro.ae",
      phone: "+971 4 555 2200",
    },
  });

  const customer = await prisma.customer.create({
    data: {
      workspaceId: workspace.id,
      name: "Spinneys Dubai",
      trn: "100111222300003",
      emirate: "Dubai",
      email: "procurement@spinneys.ae",
    },
  });

  const flour = await prisma.rawMaterial.create({
    data: {
      workspaceId: workspace.id,
      name: "Bread Flour",
      sku: "RM-FLOUR-01",
      category: "Dry Goods",
      unit: "kg",
      unitCostAed: 3.2,
      minLevel: 100,
      location: "Dry Store A",
      supplierId: supplier.id,
      allergenTags: "gluten,wheat",
    },
  });
  const yeast = await prisma.rawMaterial.create({
    data: {
      workspaceId: workspace.id,
      name: "Instant Yeast",
      sku: "RM-YEAST-01",
      category: "Dry Goods",
      unit: "kg",
      unitCostAed: 28,
      minLevel: 5,
      location: "Dry Store A",
      supplierId: supplier.id,
    },
  });
  const oil = await prisma.rawMaterial.create({
    data: {
      workspaceId: workspace.id,
      name: "Sunflower Oil",
      sku: "RM-OIL-01",
      category: "Oils",
      unit: "L",
      unitCostAed: 6.5,
      minLevel: 40,
      location: "Cold Room 1",
      supplierId: supplier.id,
    },
  });
  const salt = await prisma.rawMaterial.create({
    data: {
      workspaceId: workspace.id,
      name: "Sea Salt",
      sku: "RM-SALT-01",
      category: "Dry Goods",
      unit: "kg",
      unitCostAed: 2.1,
      minLevel: 20,
      location: "Dry Store A",
      supplierId: supplier.id,
    },
  });

  const product = await prisma.finishedProduct.create({
    data: {
      workspaceId: workspace.id,
      name: "Arabic Flatbread (pack of 6)",
      sku: "FG-FLAT-06",
      unit: "packs",
      sellPriceAed: 8.5,
      shelfLifeDays: 5,
    },
  });

  const preset = await prisma.bomPreset.create({
    data: {
      workspaceId: workspace.id,
      name: "Flatbread Standard Batch",
      productId: product.id,
      outputQty: 100,
      estHours: 2.5,
      lines: {
        create: [
          { materialId: flour.id, quantity: 25 },
          { materialId: yeast.id, quantity: 0.4 },
          { materialId: oil.id, quantity: 1.5 },
          { materialId: salt.id, quantity: 0.5 },
        ],
      },
    },
    include: { lines: { include: { material: true } } },
  });

  const now = new Date();
  const day = (n: number) => new Date(now.getTime() - n * 86400000);
  const exp = (n: number) => new Date(now.getTime() + n * 86400000);

  const lotFlour1 = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "LOT-FL-2401",
      itemType: "raw_material",
      materialId: flour.id,
      supplierLot: "EAS-8841",
      qtyInitial: 500,
      qtyRemaining: 500,
      unitCostAed: 3.15,
      receivedAt: day(12),
      expiresAt: exp(180),
      location: "Dry Store A",
      qcStatus: "Passed",
    },
  });
  const lotFlour2 = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "LOT-FL-2402",
      itemType: "raw_material",
      materialId: flour.id,
      supplierLot: "EAS-8910",
      qtyInitial: 200,
      qtyRemaining: 200,
      unitCostAed: 3.25,
      receivedAt: day(3),
      expiresAt: exp(200),
      location: "Dry Store A",
      qcStatus: "Passed",
    },
  });
  const lotYeast = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "LOT-YT-110",
      itemType: "raw_material",
      materialId: yeast.id,
      qtyInitial: 20,
      qtyRemaining: 20,
      unitCostAed: 27.5,
      receivedAt: day(8),
      expiresAt: exp(90),
      location: "Dry Store A",
      qcStatus: "Passed",
    },
  });
  const lotOil = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "LOT-OL-55",
      itemType: "raw_material",
      materialId: oil.id,
      qtyInitial: 100,
      qtyRemaining: 100,
      unitCostAed: 6.4,
      receivedAt: day(5),
      expiresAt: exp(365),
      location: "Cold Room 1",
      qcStatus: "Passed",
    },
  });
  const lotSalt = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "LOT-ST-02",
      itemType: "raw_material",
      materialId: salt.id,
      qtyInitial: 50,
      qtyRemaining: 50,
      unitCostAed: 2.0,
      receivedAt: day(20),
      expiresAt: null,
      location: "Dry Store A",
      qcStatus: "Passed",
    },
  });

  const plannedQty = 200;
  const cost = computeBatchCost({
    presetOutputQty: preset.outputQty,
    plannedQty,
    bomLines: preset.lines.map((l) => ({
      materialId: l.materialId,
      materialName: l.material.name,
      quantity: l.quantity,
      unitCostFallback: l.material.unitCostAed,
    })),
    lots: [
      lotFlour1,
      lotFlour2,
      lotYeast,
      lotOil,
      lotSalt,
    ].map((l) => ({
      id: l.id,
      lotNumber: l.lotNumber,
      materialId: l.materialId!,
      qtyRemaining: l.qtyRemaining,
      unitCostAed: l.unitCostAed,
      receivedAt: l.receivedAt,
      expiresAt: l.expiresAt,
    })),
    laborCostAed: 180,
    overheadCostAed: 45,
  });

  if (cost.unitCostAed <= 0) {
    throw new Error("Seed failed: finished goods unit cost must be > 0");
  }

  const batch = await prisma.productionBatch.create({
    data: {
      workspaceId: workspace.id,
      batchNumber: "BATCH-2026-0042",
      productId: product.id,
      presetId: preset.id,
      plannedQty,
      actualQty: plannedQty,
      status: "completed",
      startedAt: day(1),
      completedAt: day(1),
      unitCostAed: cost.unitCostAed,
    },
  });

  for (const line of cost.lines) {
    for (const alloc of line.lotAllocations) {
      await prisma.lotConsumption.create({
        data: {
          batchId: batch.id,
          lotId: alloc.lotId,
          qtyUsed: alloc.qty,
        },
      });
      await prisma.inventoryLot.update({
        where: { id: alloc.lotId },
        data: { qtyRemaining: { decrement: alloc.qty } },
      });
    }
  }

  const fgLot = await prisma.inventoryLot.create({
    data: {
      workspaceId: workspace.id,
      lotNumber: "FG-FLAT-0042",
      itemType: "finished_product",
      productId: product.id,
      qtyInitial: plannedQty,
      qtyRemaining: plannedQty - 40,
      unitCostAed: cost.unitCostAed,
      receivedAt: day(1),
      expiresAt: exp(4),
      location: "FG Cold Room",
      qcStatus: "Passed",
    },
  });

  await prisma.productionBatch.update({
    where: { id: batch.id },
    data: { outputLotId: fgLot.id },
  });

  const invSub = 40 * product.sellPriceAed;
  const vat = calcVat(invSub);

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      number: "INV-2026-0188",
      customerId: customer.id,
      status: "sent",
      issuedAt: day(0),
      dueAt: exp(14),
      subtotalAed: vat.subtotalAed,
      vatAed: vat.vatAed,
      totalAed: vat.totalAed,
      emirate: "Dubai",
      paidAed: 0,
    },
  });

  await prisma.lotDelivery.create({
    data: {
      lotId: fgLot.id,
      invoiceId: invoice.id,
      customerName: customer.name,
      qty: 40,
      deliveredAt: day(0),
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      workspaceId: workspace.id,
      number: "PO-2026-0091",
      supplierId: supplier.id,
      status: "received",
      orderedAt: day(14),
      subtotalAed: 1800,
      vatAed: 90,
    },
  });

  await prisma.salesOrder.create({
    data: {
      workspaceId: workspace.id,
      number: "SO-2026-0155",
      customerId: customer.id,
      status: "fulfilled",
      orderedAt: day(2),
      subtotalAed: invSub,
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        workspaceId: workspace.id,
        category: "Rent",
        description: "Al Quoz warehouse — March",
        amountAed: 22000,
        vatAed: 1100,
        recurring: true,
        spentAt: day(10),
      },
      {
        workspaceId: workspace.id,
        category: "Utilities",
        description: "DEWA industrial",
        amountAed: 3400,
        vatAed: 170,
        spentAt: day(4),
      },
      {
        workspaceId: workspace.id,
        category: "Labor",
        description: "Production overtime — batch 42",
        amountAed: 180,
        vatAed: 0,
        spentAt: day(1),
      },
    ],
  });

  console.log("Seeded Gulf Fresh Foods demo workspace");
  console.log(`  FG unit cost: ${cost.unitCostAed.toFixed(4)} AED (must be > 0)`);
  console.log(`  Material cost: ${cost.materialCostAed} AED`);
  console.log(`  Insufficient flags: ${cost.insufficient.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
