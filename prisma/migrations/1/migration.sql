-- DropForeignKey
ALTER TABLE "OrderStatus" DROP CONSTRAINT "OrderStatus_kitchenOrderId_fkey";

-- DropTable
DROP TABLE "OrderStatus";

-- DropEnum
DROP TYPE "Status";

