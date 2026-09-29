-- Profile equipment fields (camera, lenses, drone, phone).
ALTER TABLE "User" ADD COLUMN "cameraModel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lens1" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "lens2" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "droneModel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "phoneModel" TEXT NOT NULL DEFAULT '';
