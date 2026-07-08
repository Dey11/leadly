-- CreateEnum
CREATE TYPE "RedditTargetType" AS ENUM ('SUBREDDIT', 'CUSTOM_FEED');

-- AlterTable
ALTER TABLE "keyword_monitors" ADD COLUMN     "targetType" "RedditTargetType" NOT NULL DEFAULT 'SUBREDDIT';

-- AlterTable
ALTER TABLE "monitors" ADD COLUMN     "targetType" "RedditTargetType" NOT NULL DEFAULT 'SUBREDDIT';
