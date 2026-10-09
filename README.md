# AutoDrift - Mobile-First Car Detailing Price Catalog & Admin Control Panel

A production-grade, high-performance web application for a modern automotive detailing studio. Features a guided 4-step customer quote calculator with Claude AI vehicle sizing, running summary panel, and a protected administrative dashboard with live database updates, price matrix editor, combo savings builder, and customer analytics.

---

## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom gloss onyx & hyper-cyan detailing theme)
- **Database & ORM**: PostgreSQL via [Supabase](https://supabase.com/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Supabase Auth (Email & Password)
- **Object Storage**: Supabase Storage (`car-size-images` public bucket)
- **AI Vehicle Sizing**: Anthropic Claude API (`claude-3-haiku` with intelligent local fallback)
- **Deployment Target**: [Vercel](https://vercel.com/)

---

## 🚀 Key Features

### 1. Public Landing Page (No Login Required)
- **Step 1 - Car Size Selection**: Dynamic cards for `Small`, `Medium`, `Large`, `XL`, `XXL` with admin-uploaded images, lazy loading, and vehicle size guide examples (e.g. sedan, SUV, MPV).
- **Step 2 - Claude AI Model Recommendation**: Customers input their car (e.g., *"Toyota Fortuner 2022"*). Server API calls Claude AI to recommend the matching size. Confirms matches, prompts if the size differs, or falls back gracefully without blocking the customer. Includes in-memory sliding-window rate limiting.
- **Step 3 - Service Type**: Choose between **Normal (Individual Services)** and **Combo (Bundled Packages)**.
- **Step 4A - Normal Services**: Top 5 admin-curated services displayed by default; real-time search across all services. Multi-select checkboxes, estimated duration badges, and expandable *"What's included"* accordions.
- **Step 4B - Combos**: Top 5 combos by default with full search; single-select. Displays included services and a live **"Save ₱XXX"** badge calculated against individual service prices.
- **Quote Summary Panel**:
  - Sticky bottom sheet on mobile devices.
  - Sticky side panel on desktop screens.
  - Live running total, per-item prices, crossed-out original prices for promo sales, and disclaimer: *"Prices may vary depending on the vehicle's condition."*
- **Navigation**: Progress stepper, "Back" button on each step, and "Start Over" reset.

### 2. Protected Admin Section (`/admin`)
- **Protected by Middleware & Server Guards**: Supabase Auth verification. Public users cannot access admin pages or admin APIs.
- **Dashboard**: Quick metrics, system activity, and live **"Prices Last Updated"** timestamp.
- **Price Matrix Editor**: Editable table of **Services x Sizes** and **Combos x Sizes** with inline price inputs, promo/discount configuration (sale price, start/end date), and batch saving.
- **Services Management**: Full CRUD, active/hidden toggle, durations, and drag/move-order controls (controls which first 5 appear publicly).
- **Combo Package Builder**: Multi-select included services with **live auto-computed "Regular Total" and "Savings" per size** while editing.
- **Manage Car Sizes**: Rename sizes, edit examples, add new sizes (e.g. `XXXL`), and upload/replace/remove images stored in Supabase Storage with 2MB validation (JPG, PNG, WebP) and automatic deletion of old files on replace.
- **Price Change Audit Log**: Immutable history tracking every price change with timestamp and admin user email.
- **Analytics**: Anonymous views and selections tracked. Filter by 7 days, 30 days, or all time with visual bar charts for most popular services, combos, and car sizes.

---

## 📁 Project Structure

```
AutoDriftPricing/
├── prisma/
│   ├── schema.prisma       # Prisma models (CarSize, Service, ServicePrice, Combo, etc.)
│   └── seed.js             # Realistic Philippine car detailing catalog seed data
├── src/
│   ├── app/
│   │   ├── admin/          # Protected Admin Panel
│   │   │   ├── page.tsx            # Admin Dashboard
│   │   │   ├── prices/page.tsx     # Price Matrix Editor
│   │   │   ├── services/page.tsx   # Services CRUD & Order
│   │   │   ├── combos/page.tsx     # Combo Builder & Live Savings
│   │   │   ├── sizes/page.tsx      # Car Sizes & Image Uploads
│   │   │   ├── history/page.tsx    # Price Change Audit Trail
│   │   │   ├── analytics/page.tsx  # Customer Demand Charts
│   │   │   ├── login/page.tsx      # Admin Authentication
│   │   │   └── layout.tsx          # Admin Navigation Shell
│   │   ├── api/
│   │   │   ├── admin/      # Protected Admin API Handlers
│   │   │   ├── public/     # Live Database Data Fetching
│   │   │   ├── recommend-size/ # Claude AI Vehicle Sizing
│   │   │   └── analytics/  # Anonymous Event Logging
│   │   ├── globals.css     # Glossy Obsidian Theme & Glassmorphism
│   │   ├── layout.tsx      # Root HTML & SEO Metadata
│   │   └── page.tsx        # Public Quote Calculator
│   ├── components/
│   │   └── public/         # Public Stepper & Summary Components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client Singleton
│   │   ├── anthropic.ts    # Anthropic Claude Client & Fallbacks
│   │   ├── rate-limit.ts   # In-Memory Sliding Window Limiter
│   │   ├── auth-guard.ts   # Admin Server Authentication Guard
│   │   ├── utils.ts        # Currency (₱) & Duration Helpers
│   │   └── supabase/       # Supabase Browser, Server, & Admin Clients
│   ├── middleware.ts       # Next.js Route Protection Middleware
│   └── types/index.ts      # TypeScript Domain Interfaces
├── supabase/
│   └── storage_setup.sql   # Storage bucket creation & RLS policies
├── .env.example            # Environment variables template
└── README.md
```

---

## 🛠️ Getting Started Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your Supabase and Anthropic credentials:
```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

ANTHROPIC_API_KEY="sk-ant-api03-..."
```

> **Note for Local Testing without Supabase:** If credentials are not configured yet, the app runs in **Demo Mode** with graceful fallbacks. You can log into `/admin/login` using:
> - **Email**: `admin@autodrift.ph`
> - **Password**: `AdminAutoDrift2024!`

### 3. Initialize Database & Seed Catalog
Push Prisma schema to your PostgreSQL database and run the seed script:
```bash
# Push schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample sizes, 10 services, and 4 combos
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Storage Setup (`car-size-images`)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the SQL script from `supabase/storage_setup.sql`:

```sql
-- 1. Create or update storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-size-images',
  'car-size-images',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Public read policy
CREATE POLICY "Public car-size-images read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-size-images');

-- 3. Authenticated admin-only write policies
CREATE POLICY "Admin car-size-images insert access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-size-images');

CREATE POLICY "Admin car-size-images update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-size-images')
WITH CHECK (bucket_id = 'car-size-images');

CREATE POLICY "Admin car-size-images delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-size-images');
```

---

## 👤 Creating the First Admin User

1. In the **Supabase Dashboard**, navigate to **Authentication** -> **Users**.
2. Click **"Add user"** -> **"Create user"**.
3. Enter your admin email (e.g. `admin@autodrift.ph`) and a secure password.
4. Set **"Auto Confirm User?"** to `ON`.
5. You can now log into `/admin/login` with this account!

---

## 🚀 Deploying to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete AutoDrift pricing engine and admin panel"
   git push origin main
   ```
2. **Import Project into Vercel**:
   - Go to [Vercel](https://vercel.com/) and click **"New Project"**.
   - Select your GitHub repository `AutoDrift-car-detailing-prices`.
3. **Configure Environment Variables** in Vercel:
   - `DATABASE_URL`: Connection string with `?pgbouncer=true` (Port 6543)
   - `DIRECT_URL`: Direct connection string (Port 5432)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key
   - `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
4. **Deploy**:
   - Click **Deploy**. Vercel will build the Next.js App Router project and run `prisma generate`.
   - Any price change made in the admin panel will instantly reflect live for all customers without triggering a redeploy!
