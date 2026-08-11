-- CreateTable
CREATE TABLE "EconomicEvent" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "consensus" TEXT,
    "previous" TEXT,
    "actual" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EconomicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EconomicEvent_at_idx" ON "EconomicEvent"("at");

-- CreateIndex
CREATE UNIQUE INDEX "EconomicEvent_at_currency_event_key" ON "EconomicEvent"("at", "currency", "event");
