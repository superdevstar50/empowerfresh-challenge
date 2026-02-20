-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "store_code" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "upc_plu" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "category" TEXT,
    "unit_size" TEXT,
    "pack_size" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "upc_plu" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "price_type" TEXT,
    "start_date" TEXT,
    "end_date" TEXT,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "upc_plu" TEXT NOT NULL,
    "sale_time" TEXT,
    "unit_price" DOUBLE PRECISION,
    "units_sold" DOUBLE PRECISION,
    "total_sale" DOUBLE PRECISION,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_key" ON "customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "stores_customer_id_store_code_key" ON "stores"("customer_id", "store_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_customer_id_upc_plu_key" ON "products"("customer_id", "upc_plu");

-- CreateIndex
CREATE INDEX "prices_store_id_upc_plu_idx" ON "prices"("store_id", "upc_plu");

-- CreateIndex
CREATE INDEX "sales_store_id_upc_plu_idx" ON "sales"("store_id", "upc_plu");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
