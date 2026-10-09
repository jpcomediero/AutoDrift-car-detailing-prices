-- ==============================================================================
-- AutoDrift: Complete Database Schema & Seed Data for Supabase
-- Paste and run this script directly in your Supabase SQL Editor.
-- ==============================================================================

-- 1. DROP EXISTING TABLES IF ANY (Clean Slate)
DROP TABLE IF EXISTS "AnalyticsEvent" CASCADE;
DROP TABLE IF EXISTS "PriceHistory" CASCADE;
DROP TABLE IF EXISTS "ComboPrice" CASCADE;
DROP TABLE IF EXISTS "ComboService" CASCADE;
DROP TABLE IF EXISTS "Combo" CASCADE;
DROP TABLE IF EXISTS "ServicePrice" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "CarSize" CASCADE;

-- 2. CREATE TABLES (Exact match for Prisma models)

-- CarSize Table
CREATE TABLE "CarSize" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL UNIQUE,
  "examples" TEXT NOT NULL,
  "imageUrl" TEXT,
  "imagePath" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service Table
CREATE TABLE "Service" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ServicePrice Table
CREATE TABLE "ServicePrice" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
  "carSizeId" TEXT NOT NULL REFERENCES "CarSize"("id") ON DELETE CASCADE,
  "price" DOUBLE PRECISION NOT NULL,
  "salePrice" DOUBLE PRECISION,
  "saleStart" TIMESTAMP(3),
  "saleEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServicePrice_serviceId_carSizeId_key" UNIQUE ("serviceId", "carSizeId")
);

-- Combo Table
CREATE TABLE "Combo" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ComboService Table
CREATE TABLE "ComboService" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "comboId" TEXT NOT NULL REFERENCES "Combo"("id") ON DELETE CASCADE,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id") ON DELETE CASCADE,
  CONSTRAINT "ComboService_comboId_serviceId_key" UNIQUE ("comboId", "serviceId")
);

-- ComboPrice Table
CREATE TABLE "ComboPrice" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "comboId" TEXT NOT NULL REFERENCES "Combo"("id") ON DELETE CASCADE,
  "carSizeId" TEXT NOT NULL REFERENCES "CarSize"("id") ON DELETE CASCADE,
  "price" DOUBLE PRECISION NOT NULL,
  "salePrice" DOUBLE PRECISION,
  "saleStart" TIMESTAMP(3),
  "saleEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ComboPrice_comboId_carSizeId_key" UNIQUE ("comboId", "carSizeId")
);

-- PriceHistory Table
CREATE TABLE "PriceHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "itemType" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "carSizeId" TEXT NOT NULL REFERENCES "CarSize"("id") ON DELETE CASCADE,
  "oldPrice" DOUBLE PRECISION NOT NULL,
  "newPrice" DOUBLE PRECISION NOT NULL,
  "changedBy" TEXT NOT NULL,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AnalyticsEvent Table
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "eventType" TEXT NOT NULL,
  "itemType" TEXT,
  "itemId" TEXT,
  "carSizeId" TEXT REFERENCES "CarSize"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE INDEXES
CREATE INDEX "CarSize_sortOrder_idx" ON "CarSize"("sortOrder");
CREATE INDEX "Service_sortOrder_idx" ON "Service"("sortOrder");
CREATE INDEX "Service_active_idx" ON "Service"("active");
CREATE INDEX "ServicePrice_serviceId_idx" ON "ServicePrice"("serviceId");
CREATE INDEX "ServicePrice_carSizeId_idx" ON "ServicePrice"("carSizeId");
CREATE INDEX "Combo_sortOrder_idx" ON "Combo"("sortOrder");
CREATE INDEX "Combo_active_idx" ON "Combo"("active");
CREATE INDEX "ComboService_comboId_idx" ON "ComboService"("comboId");
CREATE INDEX "ComboService_serviceId_idx" ON "ComboService"("serviceId");
CREATE INDEX "ComboPrice_comboId_idx" ON "ComboPrice"("comboId");
CREATE INDEX "ComboPrice_carSizeId_idx" ON "ComboPrice"("carSizeId");
CREATE INDEX "PriceHistory_itemType_itemId_idx" ON "PriceHistory"("itemType", "itemId");
CREATE INDEX "PriceHistory_carSizeId_idx" ON "PriceHistory"("carSizeId");
CREATE INDEX "PriceHistory_changedAt_idx" ON "PriceHistory"("changedAt");
CREATE INDEX "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");
CREATE INDEX "AnalyticsEvent_itemType_idx" ON "AnalyticsEvent"("itemType");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- 4. SEED SAMPLE DATA DIRECTLY

-- Insert Car Sizes
INSERT INTO "CarSize" ("id", "name", "examples", "sortOrder", "imageUrl", "active") VALUES
('size_small', 'Small', 'Hatchback, compact city cars (e.g. Toyota Wigo, Honda Brio, Suzuki Swift, Mitsubishi Mirage)', 1, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', true),
('size_medium', 'Medium', 'Sedans, compact passenger cars (e.g. Toyota Vios, Honda Civic, Mazda 3, Nissan Almera)', 2, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80', true),
('size_large', 'Large', 'Compact SUV, crossovers, compact MPVs (e.g. Toyota Innova, Honda CR-V, Mazda CX-5, Ford Territory)', 3, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80', true),
('size_xl', 'XL', 'Mid-to-full size SUV, pickup trucks (e.g. Toyota Fortuner, Ford Everest, Toyota Hilux, Mitsubishi Montero)', 4, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', true),
('size_xxl', 'XXL', 'Large passenger vans, luxury MPVs, full-size trucks (e.g. Toyota Hiace, Hyundai Staria, Alphard, Ford F-150)', 5, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', true);

-- Insert Services
INSERT INTO "Service" ("id", "name", "description", "durationMinutes", "sortOrder", "active") VALUES
('svc_1', 'Exterior Foam Bath & Decontamination', 'High-lubricity snow foam pre-wash, two-bucket grit guard hand wash, iron fallout remover, clay mitt treatment to remove embedded contaminants, wheel & wheel well deep clean, and high-gloss spray sealant applied.', 60, 1, true),
('svc_2', 'Interior Deep Steam & Sanitization', 'Complete high-pressure steam cleaning of air vents, fabric/carpet hot water extraction, leather seat cleaning & conditioning, UV matte dash protectant, ozone bacterial odor elimination.', 120, 2, true),
('svc_3', 'Engine Bay Detail & Dressing', 'Delicate dry-steam engine compartment cleaning, degreasing of components, safe moisture displacement, and anti-static OEM satin protective dressing.', 45, 3, true),
('svc_4', 'Single-Stage Paint Enhancement Polish', 'Dual-action machine polish to eliminate 50-70% of light swirl marks, haze, and towel scratches, restoring deep gloss, depth, and clarity to the clear coat.', 180, 4, true),
('svc_5', 'Multi-Stage Paint Correction', 'Heavy compounding followed by fine jewel finish polishing to eradicate 85-95% of deep scratches, etching, and oxidation. The ultimate high-mirror paint transformation.', 360, 5, true),
('svc_6', 'Ceramic Glass Coating & Water Repellent', 'Hydrophobic fluoropolymer glass treatment on all windshields, side windows, and rear glass for extreme wet-weather clarity and safety.', 45, 6, true),
('svc_7', 'Undercarriage Pressure Blast & Degrease', 'High-pressure underchassis wash removing road grime, salt, and mud buildup, followed by anti-corrosion chassis rinse.', 40, 7, true),
('svc_8', 'Headlight Restoration & UV Clear Seal', 'Multi-grit wet sanding to remove yellowish oxidation and cloudiness, followed by plastic compound polish and UV ceramic clear shield.', 50, 8, true),
('svc_9', 'Leather Nourish & Ceramic Shield', 'Deep pH-neutral leather cleanse, lanolin replenishment conditioning, and hydrophobic ceramic barrier coating against dye transfer and UV cracking.', 60, 9, true),
('svc_10', '1-Year Graphene / Ceramic Paint Protection', 'Semi-permanent 9H ceramic/graphene paint coating providing extreme water beading, chemical resistance, UV shielding, and slick gloss for up to 12 months.', 240, 10, true);

-- Insert Service Prices
INSERT INTO "ServicePrice" ("serviceId", "carSizeId", "price") VALUES
('svc_1', 'size_small', 800), ('svc_1', 'size_medium', 1000), ('svc_1', 'size_large', 1200), ('svc_1', 'size_xl', 1500), ('svc_1', 'size_xxl', 1800),
('svc_2', 'size_small', 1500), ('svc_2', 'size_medium', 1800), ('svc_2', 'size_large', 2200), ('svc_2', 'size_xl', 2600), ('svc_2', 'size_xxl', 3200),
('svc_3', 'size_small', 700), ('svc_3', 'size_medium', 800), ('svc_3', 'size_large', 950), ('svc_3', 'size_xl', 1100), ('svc_3', 'size_xxl', 1300),
('svc_4', 'size_small', 2500), ('svc_4', 'size_medium', 3000), ('svc_4', 'size_large', 3600), ('svc_4', 'size_xl', 4200), ('svc_4', 'size_xxl', 5000),
('svc_5', 'size_small', 5000), ('svc_5', 'size_medium', 6000), ('svc_5', 'size_large', 7200), ('svc_5', 'size_xl', 8500), ('svc_5', 'size_xxl', 10000),
('svc_6', 'size_small', 900), ('svc_6', 'size_medium', 1100), ('svc_6', 'size_large', 1300), ('svc_6', 'size_xl', 1500), ('svc_6', 'size_xxl', 1800),
('svc_7', 'size_small', 600), ('svc_7', 'size_medium', 700), ('svc_7', 'size_large', 850), ('svc_7', 'size_xl', 1000), ('svc_7', 'size_xxl', 1200),
('svc_8', 'size_small', 800), ('svc_8', 'size_medium', 800), ('svc_8', 'size_large', 900), ('svc_8', 'size_xl', 1000), ('svc_8', 'size_xxl', 1000),
('svc_9', 'size_small', 1200), ('svc_9', 'size_medium', 1500), ('svc_9', 'size_large', 1800), ('svc_9', 'size_xl', 2200), ('svc_9', 'size_xxl', 2600),
('svc_10', 'size_small', 4500), ('svc_10', 'size_medium', 5500), ('svc_10', 'size_large', 6500), ('svc_10', 'size_xl', 7800), ('svc_10', 'size_xxl', 9200);

-- Insert Combos
INSERT INTO "Combo" ("id", "name", "description", "sortOrder", "active") VALUES
('combo_1', 'Express Clean & Gloss Revival', 'Quick yet thorough refresh: includes snow foam bath, engine bay refresh, and high-visibility glass water repellent.', 1, true),
('combo_2', 'Presidential Total Interior & Exterior Detail', 'Our signature all-around deep clean: full exterior decontamination wash, complete interior steam & extraction sanitization, engine bay dressing, headlight renewal, and chassis blast.', 2, true),
('combo_3', 'Signature Paint Correction & Ceramic Armor', 'Restore showroom mirror finish with single-stage machine paint polish and lock in extreme hydrophobic protection with a 1-year graphene ceramic coating plus full windshield treatment.', 3, true),
('combo_4', 'Connoisseur Concourse Master Package', 'The peak of automotive rejuvenation: multi-stage flawless paint correction, deep steam interior extraction, leather ceramic shield, engine bay restoration, undercarriage blast, and glass coating.', 4, true);

-- Link Combo Services
INSERT INTO "ComboService" ("comboId", "serviceId") VALUES
('combo_1', 'svc_1'), ('combo_1', 'svc_3'), ('combo_1', 'svc_6'),
('combo_2', 'svc_1'), ('combo_2', 'svc_2'), ('combo_2', 'svc_3'), ('combo_2', 'svc_7'), ('combo_2', 'svc_8'),
('combo_3', 'svc_1'), ('combo_3', 'svc_4'), ('combo_3', 'svc_6'), ('combo_3', 'svc_10'),
('combo_4', 'svc_1'), ('combo_4', 'svc_2'), ('combo_4', 'svc_3'), ('combo_4', 'svc_5'), ('combo_4', 'svc_6'), ('combo_4', 'svc_7'), ('combo_4', 'svc_9');

-- Insert Combo Prices
INSERT INTO "ComboPrice" ("comboId", "carSizeId", "price") VALUES
('combo_1', 'size_small', 2100), ('combo_1', 'size_medium', 2500), ('combo_1', 'size_large', 2950), ('combo_1', 'size_xl', 3500), ('combo_1', 'size_xxl', 4100),
('combo_2', 'size_small', 3800), ('combo_2', 'size_medium', 4400), ('combo_2', 'size_large', 5200), ('combo_2', 'size_xl', 6100), ('combo_2', 'size_xxl', 7300),
('combo_3', 'size_small', 7500), ('combo_3', 'size_medium', 9200), ('combo_3', 'size_large', 10800), ('combo_3', 'size_xl', 12800), ('combo_3', 'size_xxl', 15000),
('combo_4', 'size_small', 9500), ('combo_4', 'size_medium', 11500), ('combo_4', 'size_large', 13800), ('combo_4', 'size_xl', 16200), ('combo_4', 'size_xxl', 19000);
