-- AlterTable
ALTER TABLE `device` MODIFY `lat` DECIMAL(11, 8) NOT NULL,
    MODIFY `lon` DECIMAL(11, 8) NOT NULL;

-- CreateTable
CREATE TABLE `VMS` (
    `id` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NULL,
    `lon` DOUBLE NULL,
    `currentImage` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VMS_siteName_idx`(`siteName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VMSLog` (
    `id` VARCHAR(191) NOT NULL,
    `vmsId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,

    INDEX `VMSLog_timestamp_idx`(`timestamp`),
    UNIQUE INDEX `VMSLog_vmsId_timestamp_key`(`vmsId`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VMSLog` ADD CONSTRAINT `VMSLog_vmsId_fkey` FOREIGN KEY (`vmsId`) REFERENCES `VMS`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
