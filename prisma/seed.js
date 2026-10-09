const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AutoDrift database seeding...");

  // 1. Seed Car Sizes
  const carSizesData = [
    {
      name: "Small",
      examples: "Hatchback, compact city cars (e.g. Toyota Wigo, Honda Brio, Suzuki Swift, Mitsubishi Mirage)",
      sortOrder: 1,
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Medium",
      examples: "Sedans, compact passenger cars (e.g. Toyota Vios, Honda Civic, Mazda 3, Nissan Almera)",
      sortOrder: 2,
      imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Large",
      examples: "Compact SUV, crossovers, compact MPVs (e.g. Toyota Innova, Honda CR-V, Mazda CX-5, Ford Territory)",
      sortOrder: 3,
      imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "XL",
      examples: "Mid-to-full size SUV, pickup trucks (e.g. Toyota Fortuner, Ford Everest, Toyota Hilux, Mitsubishi Montero)",
      sortOrder: 4,
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "XXL",
      examples: "Large passenger vans, luxury MPVs, full-size trucks (e.g. Toyota Hiace, Hyundai Staria, Alphard, Ford F-150)",
      sortOrder: 5,
      imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const createdSizes = {};
  for (const size of carSizesData) {
    const record = await prisma.carSize.upsert({
      where: { name: size.name },
      update: {
        examples: size.examples,
        sortOrder: size.sortOrder,
        imageUrl: size.imageUrl,
        active: true,
      },
      create: {
        name: size.name,
        examples: size.examples,
        sortOrder: size.sortOrder,
        imageUrl: size.imageUrl,
        active: true,
      },
    });
    createdSizes[size.name] = record;
  }
  console.log(`✅ Seeded ${Object.keys(createdSizes).length} car sizes.`);

  // 2. Seed Services
  const servicesData = [
    {
      name: "Exterior Foam Bath & Decontamination",
      description: "High-lubricity snow foam pre-wash, two-bucket grit guard hand wash, iron fallout remover, clay mitt treatment to remove embedded contaminants, wheel & wheel well deep clean, and high-gloss spray sealant applied.",
      durationMinutes: 60,
      sortOrder: 1,
      prices: { Small: 800, Medium: 1000, Large: 1200, XL: 1500, XXL: 1800 },
    },
    {
      name: "Interior Deep Steam & Sanitization",
      description: "Complete high-pressure steam cleaning of air vents, fabric/carpet hot water extraction, leather seat cleaning & conditioning, UV matte dash protectant, ozone bacterial odor elimination.",
      durationMinutes: 120,
      sortOrder: 2,
      prices: { Small: 1500, Medium: 1800, Large: 2200, XL: 2600, XXL: 3200 },
    },
    {
      name: "Engine Bay Detail & Dressing",
      description: "Delicate dry-steam engine compartment cleaning, degreasing of components, safe moisture displacement, and anti-static OEM satin protective dressing.",
      durationMinutes: 45,
      sortOrder: 3,
      prices: { Small: 700, Medium: 800, Large: 950, XL: 1100, XXL: 1300 },
    },
    {
      name: "Single-Stage Paint Enhancement Polish",
      description: "Dual-action machine polish to eliminate 50-70% of light swirl marks, haze, and towel scratches, restoring deep gloss, depth, and clarity to the clear coat.",
      durationMinutes: 180,
      sortOrder: 4,
      prices: { Small: 2500, Medium: 3000, Large: 3600, XL: 4200, XXL: 5000 },
    },
    {
      name: "Multi-Stage Paint Correction",
      description: "Heavy compounding followed by fine jewel finish polishing to eradicate 85-95% of deep scratches, etching, and oxidation. The ultimate high-mirror paint transformation.",
      durationMinutes: 360,
      sortOrder: 5,
      prices: { Small: 5000, Medium: 6000, Large: 7200, XL: 8500, XXL: 10000 },
    },
    {
      name: "Ceramic Glass Coating & Water Repellent",
      description: "Hydrophobic fluoropolymer glass treatment on all windshields, side windows, and rear glass for extreme wet-weather clarity and safety.",
      durationMinutes: 45,
      sortOrder: 6,
      prices: { Small: 900, Medium: 1100, Large: 1300, XL: 1500, XXL: 1800 },
    },
    {
      name: "Undercarriage Pressure Blast & Degrease",
      description: "High-pressure underchassis wash removing road grime, salt, and mud buildup, followed by anti-corrosion chassis rinse.",
      durationMinutes: 40,
      sortOrder: 7,
      prices: { Small: 600, Medium: 700, Large: 850, XL: 1000, XXL: 1200 },
    },
    {
      name: "Headlight Restoration & UV Clear Seal",
      description: "Multi-grit wet sanding to remove yellowish oxidation and cloudiness, followed by plastic compound polish and UV ceramic clear shield.",
      durationMinutes: 50,
      sortOrder: 8,
      prices: { Small: 800, Medium: 800, Large: 900, XL: 1000, XXL: 1000 },
    },
    {
      name: "Leather Nourish & Ceramic Shield",
      description: "Deep pH-neutral leather cleanse, lanolin replenishment conditioning, and hydrophobic ceramic barrier coating against dye transfer and UV cracking.",
      durationMinutes: 60,
      sortOrder: 9,
      prices: { Small: 1200, Medium: 1500, Large: 1800, XL: 2200, XXL: 2600 },
    },
    {
      name: "1-Year Graphene / Ceramic Paint Protection",
      description: "Semi-permanent 9H ceramic/graphene paint coating providing extreme water beading, chemical resistance, UV shielding, and slick gloss for up to 12 months.",
      durationMinutes: 240,
      sortOrder: 10,
      prices: { Small: 4500, Medium: 5500, Large: 6500, XL: 7800, XXL: 9200 },
    },
  ];

  const createdServices = {};
  for (const s of servicesData) {
    // Check if service already exists by name
    let svc = await prisma.service.findFirst({ where: { name: s.name } });
    if (!svc) {
      svc = await prisma.service.create({
        data: {
          name: s.name,
          description: s.description,
          durationMinutes: s.durationMinutes,
          sortOrder: s.sortOrder,
          active: true,
        },
      });
    } else {
      svc = await prisma.service.update({
        where: { id: svc.id },
        data: {
          description: s.description,
          durationMinutes: s.durationMinutes,
          sortOrder: s.sortOrder,
          active: true,
        },
      });
    }
    createdServices[s.name] = svc;

    // Create prices for each size
    for (const [sizeName, priceVal] of Object.entries(s.prices)) {
      const sizeObj = createdSizes[sizeName];
      if (sizeObj) {
        await prisma.servicePrice.upsert({
          where: {
            serviceId_carSizeId: {
              serviceId: svc.id,
              carSizeId: sizeObj.id,
            },
          },
          update: { price: priceVal },
          create: {
            serviceId: svc.id,
            carSizeId: sizeObj.id,
            price: priceVal,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${Object.keys(createdServices).length} services with per-size pricing.`);

  // 3. Seed Combos
  const combosData = [
    {
      name: "Express Clean & Gloss Revival",
      description: "Quick yet thorough refresh: includes snow foam bath, engine bay refresh, and high-visibility glass water repellent.",
      sortOrder: 1,
      includedServices: [
        "Exterior Foam Bath & Decontamination",
        "Engine Bay Detail & Dressing",
        "Ceramic Glass Coating & Water Repellent",
      ],
      prices: { Small: 2100, Medium: 2500, Large: 2950, XL: 3500, XXL: 4100 },
    },
    {
      name: "Presidential Total Interior & Exterior Detail",
      description: "Our signature all-around deep clean: full exterior decontamination wash, complete interior steam & extraction sanitization, engine bay dressing, headlight renewal, and chassis blast.",
      sortOrder: 2,
      includedServices: [
        "Exterior Foam Bath & Decontamination",
        "Interior Deep Steam & Sanitization",
        "Engine Bay Detail & Dressing",
        "Headlight Restoration & UV Clear Seal",
        "Undercarriage Pressure Blast & Degrease",
      ],
      prices: { Small: 3800, Medium: 4400, Large: 5200, XL: 6100, XXL: 7300 },
    },
    {
      name: "Signature Paint Correction & Ceramic Armor",
      description: "Restore showroom mirror finish with single-stage machine paint polish and lock in extreme hydrophobic protection with a 1-year graphene ceramic coating plus full windshield treatment.",
      sortOrder: 3,
      includedServices: [
        "Exterior Foam Bath & Decontamination",
        "Single-Stage Paint Enhancement Polish",
        "Ceramic Glass Coating & Water Repellent",
        "1-Year Graphene / Ceramic Paint Protection",
      ],
      prices: { Small: 7500, Medium: 9200, Large: 10800, XL: 12800, XXL: 15000 },
    },
    {
      name: "Connoisseur Concourse Master Package",
      description: "The peak of automotive rejuvenation: multi-stage flawless paint correction, deep steam interior extraction, leather ceramic shield, engine bay restoration, undercarriage blast, and glass coating.",
      sortOrder: 4,
      includedServices: [
        "Exterior Foam Bath & Decontamination",
        "Interior Deep Steam & Sanitization",
        "Engine Bay Detail & Dressing",
        "Multi-Stage Paint Correction",
        "Ceramic Glass Coating & Water Repellent",
        "Leather Nourish & Ceramic Shield",
        "Undercarriage Pressure Blast & Degrease",
      ],
      prices: { Small: 9500, Medium: 11500, Large: 13800, XL: 16200, XXL: 19000 },
    },
  ];

  for (const c of combosData) {
    let combo = await prisma.combo.findFirst({ where: { name: c.name } });
    if (!combo) {
      combo = await prisma.combo.create({
        data: {
          name: c.name,
          description: c.description,
          sortOrder: c.sortOrder,
          active: true,
        },
      });
    } else {
      combo = await prisma.combo.update({
        where: { id: combo.id },
        data: {
          description: c.description,
          sortOrder: c.sortOrder,
          active: true,
        },
      });
    }

    // Link services
    for (const svcName of c.includedServices) {
      const svcObj = createdServices[svcName];
      if (svcObj) {
        await prisma.comboService.upsert({
          where: {
            comboId_serviceId: {
              comboId: combo.id,
              serviceId: svcObj.id,
            },
          },
          update: {},
          create: {
            comboId: combo.id,
            serviceId: svcObj.id,
          },
        });
      }
    }

    // Set per-size pricing
    for (const [sizeName, priceVal] of Object.entries(c.prices)) {
      const sizeObj = createdSizes[sizeName];
      if (sizeObj) {
        await prisma.comboPrice.upsert({
          where: {
            comboId_carSizeId: {
              comboId: combo.id,
              carSizeId: sizeObj.id,
            },
          },
          update: { price: priceVal },
          create: {
            comboId: combo.id,
            carSizeId: sizeObj.id,
            price: priceVal,
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${combosData.length} combos with relationships and per-size pricing.`);
  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
