import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { recommendCarSize, AvailableSize } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp, 15, 60 * 1000); // 15 requests per minute
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again shortly.",
          recognized: false,
          recommendedSize: "Medium",
          confidence: "low",
          reason: "Too many requests. Continuing with standard sizing.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const carName = typeof body?.carName === "string" ? body.carName.trim() : "";

    if (!carName) {
      return NextResponse.json(
        {
          recognized: false,
          recommendedSize: "Medium",
          confidence: "low",
          reason: "No vehicle name provided.",
        },
        { status: 400 }
      );
    }

    // 2. Fetch available active sizes from database
    let availableSizes: AvailableSize[] = [];
    try {
      const dbSizes = await prisma.carSize.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true, examples: true },
      });
      availableSizes = dbSizes;
    } catch {
      // If DB is offline or not configured yet, provide standard sizes
    }

    if (availableSizes.length === 0) {
      availableSizes = [
        { name: "Small", examples: "Hatchback, compact city cars (e.g. Toyota Wigo, Honda Brio, Suzuki Swift)" },
        { name: "Medium", examples: "Sedans, compact passenger cars (e.g. Toyota Vios, Honda Civic, Mazda 3)" },
        { name: "Large", examples: "Compact SUV, crossovers, MPVs (e.g. Toyota Innova, Honda CR-V, Mazda CX-5)" },
        { name: "XL", examples: "Mid-to-full size SUV, pickup trucks (e.g. Toyota Fortuner, Ford Everest, Hilux)" },
        { name: "XXL", examples: "Large passenger vans, full-size trucks (e.g. Toyota Hiace, Staria, Alphard)" },
      ];
    }

    // 3. Call Anthropic Claude classifier with fallback
    const recommendation = await recommendCarSize(carName, availableSizes);

    return NextResponse.json(recommendation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("Size recommendation error:", err);
    // Never block customer flow - return friendly fallback
    return NextResponse.json({
      recognized: false,
      recommendedSize: "Medium",
      confidence: "low",
      reason: message || "Size classification unavailable. You can continue with your selection.",
    });
  }
}
