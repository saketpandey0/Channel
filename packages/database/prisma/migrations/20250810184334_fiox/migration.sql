/*
  Warnings:

  - You are about to drop the column `altText` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `caption` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `uploaderId` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `media` table. All the data in the column will be lost.
  - Added the required column `path` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_uploaderId_fkey";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "altText",
DROP COLUMN "caption",
DROP COLUMN "createdAt",
DROP COLUMN "height",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "uploaderId",
DROP COLUMN "url",
DROP COLUMN "width",
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "uploadedBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
