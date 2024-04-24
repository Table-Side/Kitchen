-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('IN_PROGRESS', 'CANCELLED', 'COMPLETED');
ALTER TABLE "OrderStatus" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
COMMIT;

