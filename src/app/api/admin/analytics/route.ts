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
    const range = searchParams.get("range") || "7d"; // '7d' | '30d' | 'all'

    let startDate: Date | undefined;
    const now = new Date();

    if (range === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: { createdAt?: { gte: Date } } = {};
    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    const events = await prisma.analyticsEvent.findMany({
      where: whereClause,
      select: {
        eventType: true,
        itemType: true,
        itemId: true,
        carSizeId: true,
      },
    });

    const [services, combos, sizes] = await Promise.all([
      prisma.service.findMany({ select: { id: true, name: true } }),
      prisma.combo.findMany({ select: { id: true, name: true } }),
      prisma.carSize.findMany({ select: { id: true, name: true } }),
    ]);

    const serviceNameMap = new Map(services.map((s) => [s.id, s.name]));
    const comboNameMap = new Map(combos.map((c) => [c.id, c.name]));
    const sizeNameMap = new Map(sizes.map((s) => [s.id, s.name]));

    // 1. Most Selected Services
    const selectedServicesCount: Record<string, number> = {};
    // 2. Most Viewed/Selected Combos
    const combosCount: Record<string, number> = {};
    // 3. Most Chosen Car Sizes
    const sizesCount: Record<string, number> = {};

    let totalViews = 0;
    let totalSelections = 0;

    events.forEach((ev) => {
      if (ev.eventType === "VIEW") totalViews++;
      if (ev.eventType === "SELECT" || ev.eventType === "SIZE_CHOSEN") totalSelections++;

      if (ev.itemType === "SERVICE" && ev.itemId) {
        selectedServicesCount[ev.itemId] = (selectedServicesCount[ev.itemId] || 0) + 1;
      }
      if (ev.itemType === "COMBO" && ev.itemId) {
        combosCount[ev.itemId] = (combosCount[ev.itemId] || 0) + 1;
      }
      if ((ev.itemType === "SIZE" || ev.eventType === "SIZE_CHOSEN") && ev.carSizeId) {
        sizesCount[ev.carSizeId] = (sizesCount[ev.carSizeId] || 0) + 1;
      }
    });

    const topServices = Object.entries(selectedServicesCount)
      .map(([id, count]) => ({
        id,
        name: serviceNameMap.get(id) || `Service (${id.slice(0, 5)})`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topCombos = Object.entries(combosCount)
      .map(([id, count]) => ({
        id,
        name: comboNameMap.get(id) || `Combo (${id.slice(0, 5)})`,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const topSizes = Object.entries(sizesCount)
      .map(([id, count]) => ({
        id,
        name: sizeNameMap.get(id) || `Size (${id.slice(0, 5)})`,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      range,
      totalEvents: events.length,
      totalViews,
      totalSelections,
      topServices,
      topCombos,
      topSizes,
    });
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
