import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isSaleActive } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [sizes, services, combos] = await Promise.all([
      prisma.carSize.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.service.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          prices: true,
        },
      }),
      prisma.combo.findMany({
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: {
          prices: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      }),
    ]);

    // Compute most recent price or catalog update timestamp
    let latestTimestamp = new Date(0);

    sizes.forEach((s) => {
      if (s.updatedAt > latestTimestamp) latestTimestamp = s.updatedAt;
    });

    services.forEach((s) => {
      if (s.updatedAt > latestTimestamp) latestTimestamp = s.updatedAt;
      s.prices.forEach((p) => {
        if (p.updatedAt > latestTimestamp) latestTimestamp = p.updatedAt;
      });
    });

    combos.forEach((c) => {
      if (c.updatedAt > latestTimestamp) latestTimestamp = c.updatedAt;
      c.prices.forEach((p) => {
        if (p.updatedAt > latestTimestamp) latestTimestamp = p.updatedAt;
      });
    });

    const formattedCombos = combos.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      active: c.active,
      prices: c.prices,
      services: c.services.map((cs) => cs.service),
    }));

    return NextResponse.json(
      {
        sizes,
        services,
        combos: formattedCombos,
        lastUpdated: latestTimestamp.getTime() > 0 ? latestTimestamp.toISOString() : new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.warn("Database read error or not yet provisioned, providing default catalog fallback:", error);

    // Provide default fallback data if DB is still being configured
    const fallbackSizes = [
      {
        id: "size-1",
        name: "Small",
        examples: "Hatchback, compact city cars (e.g. Toyota Wigo, Honda Brio, Suzuki Swift, Mitsubishi Mirage)",
        sortOrder: 1,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "size-2",
        name: "Medium",
        examples: "Sedans, compact passenger cars (e.g. Toyota Vios, Honda Civic, Mazda 3, Nissan Almera)",
        sortOrder: 2,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "size-3",
        name: "Large",
        examples: "Compact SUV, crossovers, compact MPVs (e.g. Toyota Innova, Honda CR-V, Mazda CX-5, Ford Territory)",
        sortOrder: 3,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "size-4",
        name: "XL",
        examples: "Mid-to-full size SUV, pickup trucks (e.g. Toyota Fortuner, Ford Everest, Toyota Hilux, Mitsubishi Montero)",
        sortOrder: 4,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "size-5",
        name: "XXL",
        examples: "Large passenger vans, luxury MPVs, full-size trucks (e.g. Toyota Hiace, Hyundai Staria, Alphard, Ford F-150)",
        sortOrder: 5,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
      },
    ];

    const fallbackServices = [
      {
        id: "svc-1",
        name: "Exterior Foam Bath & Decontamination",
        description: "High-lubricity snow foam pre-wash, two-bucket hand wash, fallout remover, clay mitt, wheel deep clean, and high-gloss spray sealant applied.",
        durationMinutes: 60,
        sortOrder: 1,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 800 },
          { carSizeId: "size-2", price: 1000 },
          { carSizeId: "size-3", price: 1200 },
          { carSizeId: "size-4", price: 1500 },
          { carSizeId: "size-5", price: 1800 },
        ],
      },
      {
        id: "svc-2",
        name: "Interior Deep Steam & Sanitization",
        description: "High-pressure vent steam cleaning, hot water carpet & upholstery extraction, leather conditioning, UV dash protectant, and ozone deodorization.",
        durationMinutes: 120,
        sortOrder: 2,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 1500 },
          { carSizeId: "size-2", price: 1800 },
          { carSizeId: "size-3", price: 2200 },
          { carSizeId: "size-4", price: 2600 },
          { carSizeId: "size-5", price: 3200 },
        ],
      },
      {
        id: "svc-3",
        name: "Engine Bay Detail & Dressing",
        description: "Dry steam engine compartment cleanse, safe electrical component masking, grease removal, and OEM satin anti-static dressing.",
        durationMinutes: 45,
        sortOrder: 3,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 700 },
          { carSizeId: "size-2", price: 800 },
          { carSizeId: "size-3", price: 950 },
          { carSizeId: "size-4", price: 1100 },
          { carSizeId: "size-5", price: 1300 },
        ],
      },
      {
        id: "svc-4",
        name: "Single-Stage Paint Enhancement Polish",
        description: "Dual-action machine polish eliminating light swirl marks and haze, restoring high optical clarity, mirror gloss, and paint depth.",
        durationMinutes: 180,
        sortOrder: 4,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 2500 },
          { carSizeId: "size-2", price: 3000 },
          { carSizeId: "size-3", price: 3600 },
          { carSizeId: "size-4", price: 4200 },
          { carSizeId: "size-5", price: 5000 },
        ],
      },
      {
        id: "svc-5",
        name: "Multi-Stage Paint Correction",
        description: "Multi-step heavy compounding and fine jeweling to eradicate 85-95% of scratches, swirls, and oxidation. Ultimate showroom mirror finish.",
        durationMinutes: 360,
        sortOrder: 5,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 5000 },
          { carSizeId: "size-2", price: 6000 },
          { carSizeId: "size-3", price: 7200 },
          { carSizeId: "size-4", price: 8500 },
          { carSizeId: "size-5", price: 10000 },
        ],
      },
      {
        id: "svc-6",
        name: "Ceramic Glass Coating & Water Repellent",
        description: "Hydrophobic fluoropolymer treatment applied on all glass panels for extreme water beading and clear vision during heavy rain.",
        durationMinutes: 45,
        sortOrder: 6,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 900 },
          { carSizeId: "size-2", price: 1100 },
          { carSizeId: "size-3", price: 1300 },
          { carSizeId: "size-4", price: 1500 },
          { carSizeId: "size-5", price: 1800 },
        ],
      },
      {
        id: "svc-7",
        name: "Undercarriage Pressure Blast & Degrease",
        description: "High-pressure underside wash removing road grime, salt, and mud buildup, followed by anti-corrosion chassis rinse.",
        durationMinutes: 40,
        sortOrder: 7,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 600 },
          { carSizeId: "size-2", price: 700 },
          { carSizeId: "size-3", price: 850 },
          { carSizeId: "size-4", price: 1000 },
          { carSizeId: "size-5", price: 1200 },
        ],
      },
      {
        id: "svc-8",
        name: "Headlight Restoration & UV Clear Seal",
        description: "Multi-grit wet sanding removing yellow oxidation and hazy lenses, with clear UV ceramic coating to prevent future discoloration.",
        durationMinutes: 50,
        sortOrder: 8,
        active: true,
        prices: [
          { carSizeId: "size-1", price: 800 },
          { carSizeId: "size-2", price: 800 },
          { carSizeId: "size-3", price: 900 },
          { carSizeId: "size-4", price: 1000 },
          { carSizeId: "size-5", price: 1000 },
        ],
      },
    ];

    const fallbackCombos = [
      {
        id: "combo-1",
        name: "Express Clean & Gloss Revival",
        description: "Quick yet thorough refresh: includes snow foam bath, engine bay refresh, and high-visibility glass water repellent.",
        sortOrder: 1,
        active: true,
        services: [fallbackServices[0], fallbackServices[2], fallbackServices[5]],
        prices: [
          { carSizeId: "size-1", price: 2100 },
          { carSizeId: "size-2", price: 2500 },
          { carSizeId: "size-3", price: 2950 },
          { carSizeId: "size-4", price: 3500 },
          { carSizeId: "size-5", price: 4100 },
        ],
      },
      {
        id: "combo-2",
        name: "Presidential Total Interior & Exterior Detail",
        description: "Our signature all-around deep clean: full exterior decontamination wash, complete interior steam & extraction sanitization, engine bay dressing, headlight renewal, and chassis blast.",
        sortOrder: 2,
        active: true,
        services: [
          fallbackServices[0],
          fallbackServices[1],
          fallbackServices[2],
          fallbackServices[6],
          fallbackServices[7],
        ],
        prices: [
          { carSizeId: "size-1", price: 3800 },
          { carSizeId: "size-2", price: 4400 },
          { carSizeId: "size-3", price: 5200 },
          { carSizeId: "size-4", price: 6100 },
          { carSizeId: "size-5", price: 7300 },
        ],
      },
      {
        id: "combo-3",
        name: "Signature Paint Correction & Ceramic Armor",
        description: "Restore showroom mirror finish with single-stage machine paint polish and lock in extreme hydrophobic protection with glass treatment and sealant.",
        sortOrder: 3,
        active: true,
        services: [fallbackServices[0], fallbackServices[3], fallbackServices[5]],
        prices: [
          { carSizeId: "size-1", price: 7500 },
          { carSizeId: "size-2", price: 9200 },
          { carSizeId: "size-3", price: 10800 },
          { carSizeId: "size-4", price: 12800 },
          { carSizeId: "size-5", price: 15000 },
        ],
      },
    ];

    return NextResponse.json({
      sizes: fallbackSizes,
      services: fallbackServices,
      combos: fallbackCombos,
      lastUpdated: new Date().toISOString(),
    });
  }
}
