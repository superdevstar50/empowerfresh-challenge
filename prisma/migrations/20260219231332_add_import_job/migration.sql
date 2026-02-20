-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);
