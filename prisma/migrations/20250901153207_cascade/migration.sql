-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_retroId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."Comment" ALTER COLUMN "votes" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_retroId_fkey" FOREIGN KEY ("retroId") REFERENCES "public"."Retro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
