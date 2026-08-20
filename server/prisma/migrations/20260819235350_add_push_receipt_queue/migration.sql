-- CreateTable
CREATE TABLE "PushReceiptQueue" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushReceiptQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushReceiptQueue_receiptId_key" ON "PushReceiptQueue"("receiptId");
