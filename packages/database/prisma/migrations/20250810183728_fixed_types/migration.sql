/*
  Warnings:

  - Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `mimeType` on the `media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "media" ADD COLUMN     "type" "MediaType" NOT NULL,
DROP COLUMN "mimeType",
ADD COLUMN     "mimeType" TEXT NOT NULL;
