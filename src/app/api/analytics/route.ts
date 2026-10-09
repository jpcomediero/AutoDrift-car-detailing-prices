import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, itemType, itemId, carSizeId } = body;

    if (!eventType) {
      return NextResponse.json({ error: "Missing eventType" }, { status: 400 });
    }

    try {
      await prisma.analyticsEvent.create({
        data: {
          eventType: String(eventType).slice(0, 50),
          itemType: itemType ? String(itemType).slice(0, 50) : null,
          itemId: itemId ? String(itemId).slice(0, 100) : null,
          carSizeId: carSizeId ? String(carSizeId).slice(0, 100) : null,
        },
      });
    } catch {
      // In development or if DB is offline, continue silently
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
