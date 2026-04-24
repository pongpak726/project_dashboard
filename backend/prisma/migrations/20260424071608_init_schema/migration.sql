-- CreateTable
CREATE TABLE `Device` (
    `id` VARCHAR(191) NOT NULL,
    `siteName` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lon` DOUBLE NOT NULL,

    INDEX `Device_siteName_idx`(`siteName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Weather` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `temperature` DOUBLE NOT NULL,
    `humidity` DOUBLE NOT NULL,
    `pm25` DOUBLE NOT NULL,
    `rain` DOUBLE NULL,
    `windSpeed` DOUBLE NULL,
    `windDirection` DOUBLE NULL,
    `timestamp` DATETIME(3) NOT NULL,

    INDEX `Weather_timestamp_idx`(`timestamp`),
    UNIQUE INDEX `Weather_deviceId_timestamp_key`(`deviceId`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parking` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `available` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL,

    INDEX `Parking_timestamp_idx`(`timestamp`),
    UNIQUE INDEX `Parking_deviceId_timestamp_key`(`deviceId`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restroom` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `maleStalls` INTEGER NOT NULL,
    `maleAvailable` INTEGER NOT NULL,
    `femaleStalls` INTEGER NOT NULL,
    `femaleAvailable` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,

    INDEX `Restroom_timestamp_idx`(`timestamp`),
    UNIQUE INDEX `Restroom_deviceId_timestamp_key`(`deviceId`, `timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Weather` ADD CONSTRAINT `Weather_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `Device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parking` ADD CONSTRAINT `Parking_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `Device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Restroom` ADD CONSTRAINT `Restroom_deviceId_fkey` FOREIGN KEY (`deviceId`) REFERENCES `Device`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
