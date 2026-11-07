-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."Action" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "retroId" TEXT NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Action" ADD CONSTRAINT "Action_retroId_fkey" FOREIGN KEY ("retroId") REFERENCES "public"."Retro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
