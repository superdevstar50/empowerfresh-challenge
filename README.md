# Grocery Data Processing (Empowerfresh UI)

SvelteKit app for uploading, processing, and exploring grocery CSV data. ETL pipelines normalize and load data into PostgreSQL; you can filter and view products, prices, and sales by customer and store.

## Prerequisites

- **Node.js** 18+
- **Docker** (optional, for running PostgreSQL via Docker Compose)

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Database

**Option A: Docker (recommended)**

```bash
docker compose up -d
```

Postgres runs on port **5433** with database `grocery_etl`, user `postgres`, password `postgres`.

**Option B:** Use an existing PostgreSQL instance and note its connection URL.

### 3. Environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/grocery_etl"
```

Adjust the URL if your host, port, user, or database differ.

### 4. Migrate and seed (optional)

```bash
npx prisma migrate dev
npx prisma db seed
```

The seed creates three customers: J&A Grocers, Colin's Market, Steven's Produce.

### 5. Run the app

```bash
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`). Use **Import** to upload CSVs and run ETL, and **Explore** to view data. **Pipelines** shows current and past import jobs.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite). |
| `npm run build` | Production build. |
| `npm run preview` | Serve production build locally. |
| `npx prisma migrate dev` | Apply migrations and regenerate Prisma Client. |
| `npx prisma db seed` | Seed customers (and optionally stores). |
| `npm run check` | Run `svelte-check` (types). |

## Project layout

- **`src/routes/`** — SvelteKit pages and API routes.
- **`src/features/`** — Feature UI (explore, import, pipelines).
- **`src/components/`** — Shared UI components.
- **`src/lib/etl/`** — ETL: preprocess, column mapping, detection, pipeline, job store, processJob.
- **`src/lib/db/`** — Prisma client.
- **`prisma/`** — Schema, migrations, seed.
