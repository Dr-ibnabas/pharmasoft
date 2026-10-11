-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('CLIENT_RETURN', 'ERROR', 'DEFECT', 'EXPIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('OPEN', 'VALIDATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SALE_REFUND';
ALTER TYPE "AuditAction" ADD VALUE 'PURCHASE_ORDER';
ALTER TYPE "AuditAction" ADD VALUE 'PURCHASE_RECEIVE';
ALTER TYPE "AuditAction" ADD VALUE 'INVENTORY_OPEN';
ALTER TYPE "AuditAction" ADD VALUE 'INVENTORY_CLOSE';
ALTER TYPE "AuditAction" ADD VALUE 'INVOICE_ISSUE';
ALTER TYPE "AuditAction" ADD VALUE 'CONTROLLED_DISPENSE';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "amountPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "changeGiven" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "clientDue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "insuranceCovered" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" INTEGER NOT NULL,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientNif" TEXT,
    "subtotal" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "taxRate" DECIMAL(4,4) NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedById" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "RefundReason" NOT NULL,
    "amount" INTEGER NOT NULL,
    "restock" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundLine" (
    "id" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "lotId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,

    CONSTRAINT "RefundLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'OPEN',
    "startedById" TEXT NOT NULL,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "InventorySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryCountLine" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "lotId" TEXT,
    "expectedQty" INTEGER NOT NULL,
    "countedQty" INTEGER,
    "difference" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InventoryCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlledRegisterEntry" (
    "id" TEXT NOT NULL,
    "entryNumber" INTEGER NOT NULL,
    "saleId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "doctorName" TEXT,
    "prescriptionCode" TEXT,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlledRegisterEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_saleId_idx" ON "Payment"("saleId");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_saleId_key" ON "Invoice"("saleId");

-- CreateIndex
CREATE INDEX "Invoice_issuedAt_idx" ON "Invoice"("issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_code_key" ON "Refund"("code");

-- CreateIndex
CREATE INDEX "Refund_saleId_idx" ON "Refund"("saleId");

-- CreateIndex
CREATE INDEX "Refund_createdAt_idx" ON "Refund"("createdAt");

-- CreateIndex
CREATE INDEX "RefundLine_refundId_idx" ON "RefundLine"("refundId");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySession_code_key" ON "InventorySession"("code");

-- CreateIndex
CREATE INDEX "InventorySession_status_idx" ON "InventorySession"("status");

-- CreateIndex
CREATE INDEX "InventoryCountLine_sessionId_idx" ON "InventoryCountLine"("sessionId");

-- CreateIndex
CREATE INDEX "ControlledRegisterEntry_medicineId_createdAt_idx" ON "ControlledRegisterEntry"("medicineId", "createdAt");

-- CreateIndex
CREATE INDEX "ControlledRegisterEntry_entryNumber_idx" ON "ControlledRegisterEntry"("entryNumber");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundLine" ADD CONSTRAINT "RefundLine_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySession" ADD CONSTRAINT "InventorySession_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InventorySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCountLine" ADD CONSTRAINT "InventoryCountLine_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledRegisterEntry" ADD CONSTRAINT "ControlledRegisterEntry_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledRegisterEntry" ADD CONSTRAINT "ControlledRegisterEntry_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlledRegisterEntry" ADD CONSTRAINT "ControlledRegisterEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
