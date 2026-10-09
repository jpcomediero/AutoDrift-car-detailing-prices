import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const combos = await prisma.combo.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        prices: true,
        services: {
          include: { service: true },
        },
      },
    });

    const formatted = combos.map((c) => ({
      ...c,
      services: c.services.map((cs) => cs.service),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Fetch combos error:", err);
    return NextResponse.json({ error: "Failed to fetch combos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, serviceIds, prices, active = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Combo name is required" }, { status: 400 });
    }

    const maxSort = await prisma.combo.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder = (maxSort._max.sortOrder ?? 0) + 1;

    // Create combo
    const combo = await prisma.combo.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        sortOrder: nextOrder,
        active: Boolean(active),
      },
    });

    // Link included services
    if (Array.isArray(serviceIds)) {
      for (const serviceId of serviceIds) {
        await prisma.comboService.create({
          data: {
            comboId: combo.id,
            serviceId,
          },
        });
      }
    }

    // Set prices for car sizes
    if (prices && typeof prices === "object") {
      for (const [carSizeId, priceVal] of Object.entries(prices)) {
        const numericPrice = Number(priceVal) || 0;
        await prisma.comboPrice.create({
          data: {
            comboId: combo.id,
            carSizeId,
            price: numericPrice,
          },
        });

        // Audit log
        await prisma.priceHistory.create({
          data: {
            itemType: "COMBO",
            itemId: combo.id,
            carSizeId,
            oldPrice: 0,
            newPrice: numericPrice,
            changedBy: admin.email,
          },
        });
      }
    }

    const created = await prisma.combo.findUnique({
      where: { id: combo.id },
      include: {
        prices: true,
        services: { include: { service: true } },
      },
    });

    return NextResponse.json({
      ...created,
      services: created?.services.map((cs) => cs.service) || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Creation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check if bulk reorder
    if (Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        await prisma.combo.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      }
      return NextResponse.json({ success: true });
    }

    const { id, name, description, serviceIds, active, sortOrder } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing combo ID" }, { status: 400 });
    }

    // Update combo base info
    await prisma.combo.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });

    // Update linked services if provided
    if (Array.isArray(serviceIds)) {
      // Remove old associations
      await prisma.comboService.deleteMany({
        where: { comboId: id },
      });
      // Insert new associations
      for (const serviceId of serviceIds) {
        await prisma.comboService.create({
          data: {
            comboId: id,
            serviceId,
          },
        });
      }
    }

    const updated = await prisma.combo.findUnique({
      where: { id },
      include: {
        prices: true,
        services: { include: { service: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      services: updated?.services.map((cs) => cs.service) || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Update error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing combo ID" }, { status: 400 });
    }

    await prisma.combo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
