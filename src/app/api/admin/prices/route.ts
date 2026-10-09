import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [sizes, services, combos] = await Promise.all([
      prisma.carSize.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.service.findMany({
        orderBy: { sortOrder: "asc" },
        include: { prices: true },
      }),
      prisma.combo.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          prices: true,
          services: { include: { service: true } },
        },
      }),
    ]);

    // Find most recent updated price timestamp
    let latestUpdate = new Date(0);
    services.forEach((s) => {
      s.prices.forEach((p) => {
        if (p.updatedAt > latestUpdate) latestUpdate = p.updatedAt;
      });
    });
    combos.forEach((c) => {
      c.prices.forEach((p) => {
        if (p.updatedAt > latestUpdate) latestUpdate = p.updatedAt;
      });
    });

    return NextResponse.json({
      sizes,
      services,
      combos: combos.map((c) => ({
        ...c,
        services: c.services.map((cs) => cs.service),
      })),
      lastUpdated: latestUpdate.getTime() > 0 ? latestUpdate.toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.error("Fetch prices matrix error:", err);
    return NextResponse.json({ error: "Failed to load price matrix" }, { status: 500 });
  }
}

interface PriceUpdateEntry {
  type: "SERVICE" | "COMBO";
  itemId: string;
  carSizeId: string;
  price: number;
  salePrice?: number | null;
  saleStart?: string | null;
  saleEnd?: string | null;
}

export async function PUT(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: PriceUpdateEntry[] = body.updates;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Updates array required" }, { status: 400 });
    }

    const historyToInsert: {
      itemType: string;
      itemId: string;
      carSizeId: string;
      oldPrice: number;
      newPrice: number;
      changedBy: string;
    }[] = [];

    for (const item of updates) {
      const newPrice = Number(item.price) || 0;
      const salePrice = item.salePrice ? Number(item.salePrice) : null;
      const saleStart = item.saleStart ? new Date(item.saleStart) : null;
      const saleEnd = item.saleEnd ? new Date(item.saleEnd) : null;

      if (item.type === "SERVICE") {
        const existing = await prisma.servicePrice.findUnique({
          where: {
            serviceId_carSizeId: {
              serviceId: item.itemId,
              carSizeId: item.carSizeId,
            },
          },
        });

        const oldPrice = existing ? existing.price : 0;

        await prisma.servicePrice.upsert({
          where: {
            serviceId_carSizeId: {
              serviceId: item.itemId,
              carSizeId: item.carSizeId,
            },
          },
          update: {
            price: newPrice,
            salePrice,
            saleStart,
            saleEnd,
          },
          create: {
            serviceId: item.itemId,
            carSizeId: item.carSizeId,
            price: newPrice,
            salePrice,
            saleStart,
            saleEnd,
          },
        });

        // Audit log if price changed
        if (!existing || existing.price !== newPrice) {
          historyToInsert.push({
            itemType: "SERVICE",
            itemId: item.itemId,
            carSizeId: item.carSizeId,
            oldPrice,
            newPrice,
            changedBy: admin.email,
          });
        }
      } else if (item.type === "COMBO") {
        const existing = await prisma.comboPrice.findUnique({
          where: {
            comboId_carSizeId: {
              comboId: item.itemId,
              carSizeId: item.carSizeId,
            },
          },
        });

        const oldPrice = existing ? existing.price : 0;

        await prisma.comboPrice.upsert({
          where: {
            comboId_carSizeId: {
              comboId: item.itemId,
              carSizeId: item.carSizeId,
            },
          },
          update: {
            price: newPrice,
            salePrice,
            saleStart,
            saleEnd,
          },
          create: {
            comboId: item.itemId,
            carSizeId: item.carSizeId,
            price: newPrice,
            salePrice,
            saleStart,
            saleEnd,
          },
        });

        if (!existing || existing.price !== newPrice) {
          historyToInsert.push({
            itemType: "COMBO",
            itemId: item.itemId,
            carSizeId: item.carSizeId,
            oldPrice,
            newPrice,
            changedBy: admin.email,
          });
        }
      }
    }

    // Insert all price history logs
    for (const h of historyToInsert) {
      await prisma.priceHistory.create({
        data: h,
      });
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
      historyCount: historyToInsert.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Price update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
