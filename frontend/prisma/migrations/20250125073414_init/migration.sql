-- CreateTable
CREATE TABLE "Rate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "usdToEur" DOUBLE PRECISION,
    "usdcToEur" DOUBLE PRECISION,
    "eurToUsd" DOUBLE PRECISION,
    "eurToUsdc" DOUBLE PRECISION,
    "usdToGbp" DOUBLE PRECISION,
    "usdcToGbp" DOUBLE PRECISION,
    "gbpToUsd" DOUBLE PRECISION,
    "gbpToUsdc" DOUBLE PRECISION,
    "usdToTwd" DOUBLE PRECISION,
    "usdcToTwd" DOUBLE PRECISION,
    "twdToUsd" DOUBLE PRECISION,
    "twdToUsdc" DOUBLE PRECISION,

    CONSTRAINT "Rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenRate" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "usdcToEur" DOUBLE PRECISION,
    "eurToUsdc" DOUBLE PRECISION,
    "usdcToGbp" DOUBLE PRECISION,
    "gbpToUsdc" DOUBLE PRECISION,
    "usdcToTwd" DOUBLE PRECISION,
    "twdToUsdc" DOUBLE PRECISION,

    CONSTRAINT "TokenRate_pkey" PRIMARY KEY ("id")
);
