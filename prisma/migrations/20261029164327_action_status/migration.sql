-- CreateEnum
CREATE TYPE "public"."ActionStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'NOT_NEEDED');

-- AlterTable
ALTER TABLE "public"."Action" ADD COLUMN     "status" "public"."ActionStatus" NOT NULL DEFAULT 'NEW';
