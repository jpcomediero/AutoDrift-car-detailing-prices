import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const itemType = searchParams.get("itemType"); // 'SERVICE' | 'COMBO' | null

    const whereClause: { itemType?: string } = {};
    if (itemType && (itemType === "SERVICE" || itemType === "COMBO")) {
      whereClause.itemType = itemType;
    }

    const history = await prisma.priceHistory.findMany({
      where: whereClause,
      orderBy: { changedAt: "desc" },
      take: 100,
      include: {
        carSize: {
          select: { name: true },
        },
      },
    });

    // Lookup service and combo names for clear readability
    const services = await prisma.service.findMany({ select: { id: true, name: true } });
    const combos = await prisma.combo.findMany({ select: { id: true, name: true } });

    const serviceMap = new Map(services.map((s) => [s.id, s.name]));
    const comboMap = new Map(combos.map((c) => [c.id, c.name]));

    const enriched = history.map((h) => {
      let itemName = "Item";
      if (h.itemType === "SERVICE") {
        itemName = serviceMap.get(h.itemId) || `Service (${h.itemId.slice(0, 6)})`;
      } else {
        itemName = comboMap.get(h.itemId) || `Combo (${h.itemId.slice(0, 6)})`;
      }

      return {
        id: h.id,
        itemType: h.itemType,
        itemId: h.itemId,
        itemName,
        carSizeId: h.carSizeId,
        carSizeName: h.carSize?.name || "Size",
        oldPrice: h.oldPrice,
        newPrice: h.newPrice,
        changedBy: h.changedBy,
        changedAt: h.changedAt.toISOString(),
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Fetch price history error:", err);
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 });
  }
}
