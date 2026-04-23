-- AlterTable
ALTER TABLE `user` ADD COLUMN `username` VARCHAR(191) NULL;



-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);