import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        prices: true,
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Fetch services error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, durationMinutes, prices, active = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }

    // Determine next sort order
    const maxSort = await prisma.service.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder = (maxSort._max.sortOrder ?? 0) + 1;

    // Create service
    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        durationMinutes: Number(durationMinutes) || 60,
        sortOrder: nextOrder,
        active: Boolean(active),
      },
    });

    // Create prices for all car sizes if provided
    if (prices && typeof prices === "object") {
      const priceEntries = Object.entries(prices).map(([sizeId, priceVal]) => ({
        serviceId: service.id,
        carSizeId: sizeId,
        price: Number(priceVal) || 0,
      }));

      for (const entry of priceEntries) {
        await prisma.servicePrice.create({
          data: entry,
        });

        // Log initial price in history
        await prisma.priceHistory.create({
          data: {
            itemType: "SERVICE",
            itemId: service.id,
            carSizeId: entry.carSizeId,
            oldPrice: 0,
            newPrice: entry.price,
            changedBy: admin.email,
          },
        });
      }
    }

    const created = await prisma.service.findUnique({
      where: { id: service.id },
      include: { prices: true },
    });

    return NextResponse.json(created);
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

    // Check if bulk reorder operation
    if (Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        await prisma.service.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      }
      return NextResponse.json({ success: true });
    }

    const { id, name, description, durationMinutes, active, sortOrder } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(durationMinutes !== undefined && {
          durationMinutes: Number(durationMinutes),
        }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
      include: { prices: true },
    });

    return NextResponse.json(updated);
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
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
