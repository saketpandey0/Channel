-- CreateEnum
CREATE TYPE "public"."FlagType" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'COPYRIGHT_VIOLATION', 'HATE_SPEECH', 'MISINFORMATION', 'ADMIN_FLAG', 'AUTO_FLAG');

-- CreateEnum
CREATE TYPE "public"."FlagStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "public"."SiteNotificationType" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'MAINTENANCE', 'FEATURE');

-- CreateEnum
CREATE TYPE "public"."ModerationActionType" AS ENUM ('WARNING', 'TEMPORARY_SUSPENSION', 'PERMANENT_BAN', 'CONTENT_REMOVAL', 'COMMENT_RESTRICTION', 'PUBLISHING_RESTRICTION');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('USER_WELCOME', 'STORY_APPROVED', 'STORY_REJECTED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'WARNING_NOTICE', 'NEWSLETTER', 'ADMIN_ALERT');

-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "hiddenAt" TIMESTAMP(3),
ADD COLUMN     "hiddenBy" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."media" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."stories" ADD COLUMN     "lastModeratedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedBy" TEXT,
ADD COLUMN     "moderationNotes" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "loginCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."admin_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_flags" (
    "id" TEXT NOT NULL,
    "storyId" TEXT,
    "commentId" TEXT,
    "userId" TEXT,
    "flaggedBy" TEXT NOT NULL,
    "type" "public"."FlagType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "public"."FlagStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."SiteNotificationType" NOT NULL,
    "createdBy" TEXT NOT NULL,
    "targetRole" "public"."UserRole",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_actions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "public"."ModerationActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" INTEGER,
    "moderatorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "templateType" "public"."EmailTemplateType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "responseStatus" INTEGER NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_logs_adminId_createdAt_idx" ON "public"."admin_logs"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_logs_targetType_targetId_idx" ON "public"."admin_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "content_flags_storyId_status_idx" ON "public"."content_flags"("storyId", "status");

-- CreateIndex
CREATE INDEX "content_flags_commentId_status_idx" ON "public"."content_flags"("commentId", "status");

-- CreateIndex
CREATE INDEX "content_flags_userId_status_idx" ON "public"."content_flags"("userId", "status");

-- CreateIndex
CREATE INDEX "moderation_actions_userId_isActive_idx" ON "public"."moderation_actions"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "public"."email_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "api_usage_endpoint_createdAt_idx" ON "public"."api_usage"("endpoint", "createdAt");

-- CreateIndex
CREATE INDEX "api_usage_userId_createdAt_idx" ON "public"."api_usage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."stories" ADD CONSTRAINT "stories_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_flags" ADD CONSTRAINT "content_flags_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "public"."stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_flags" ADD CONSTRAINT "content_flags_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_flags" ADD CONSTRAINT "content_flags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_flags" ADD CONSTRAINT "content_flags_flaggedBy_fkey" FOREIGN KEY ("flaggedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_flags" ADD CONSTRAINT "content_flags_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."site_notifications" ADD CONSTRAINT "site_notifications_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_revokedBy_fkey" FOREIGN KEY ("revokedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_config" ADD CONSTRAINT "system_config_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_usage" ADD CONSTRAINT "api_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
