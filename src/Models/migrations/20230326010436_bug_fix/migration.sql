-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;
