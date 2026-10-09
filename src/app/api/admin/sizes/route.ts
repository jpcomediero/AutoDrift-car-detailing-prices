import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sizes = await prisma.carSize.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(sizes);
  } catch (err) {
    console.error("Fetch sizes error:", err);
    return NextResponse.json({ error: "Failed to fetch sizes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, examples, imageUrl, imagePath, active = true } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Size name is required" }, { status: 400 });
    }

    // Check unique name
    const existing = await prisma.carSize.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Car size with name "${name.trim()}" already exists` },
        { status: 400 }
      );
    }

    const maxSort = await prisma.carSize.aggregate({
      _max: { sortOrder: true },
    });
    const nextOrder = (maxSort._max.sortOrder ?? 0) + 1;

    // Create new car size
    const newSize = await prisma.carSize.create({
      data: {
        name: name.trim(),
        examples: examples?.trim() || "Vehicle examples",
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
        sortOrder: nextOrder,
        active: Boolean(active),
      },
    });

    // Automatically create default price entries for all existing services & combos
    const allServices = await prisma.service.findMany({ select: { id: true } });
    for (const svc of allServices) {
      await prisma.servicePrice.upsert({
        where: {
          serviceId_carSizeId: {
            serviceId: svc.id,
            carSizeId: newSize.id,
          },
        },
        update: {},
        create: {
          serviceId: svc.id,
          carSizeId: newSize.id,
          price: 0,
        },
      });
    }

    const allCombos = await prisma.combo.findMany({ select: { id: true } });
    for (const combo of allCombos) {
      await prisma.comboPrice.upsert({
        where: {
          comboId_carSizeId: {
            comboId: combo.id,
            carSizeId: newSize.id,
          },
        },
        update: {},
        create: {
          comboId: combo.id,
          carSizeId: newSize.id,
          price: 0,
        },
      });
    }

    return NextResponse.json(newSize);
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
    const { id, name, examples, active, sortOrder, imageUrl, imagePath } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing size ID" }, { status: 400 });
    }

    const updated = await prisma.carSize.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(examples !== undefined && { examples: examples.trim() }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imagePath !== undefined && { imagePath }),
      },
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
      return NextResponse.json({ error: "Missing size ID" }, { status: 400 });
    }

    const size = await prisma.carSize.findUnique({
      where: { id },
    });

    // If size had a Supabase storage image, delete it from storage
    if (size?.imagePath) {
      try {
        const supabase = createAdminClient();
        await supabase.storage.from("car-size-images").remove([size.imagePath]);
      } catch (e) {
        console.warn("Storage deletion error:", e);
      }
    }

    await prisma.carSize.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
