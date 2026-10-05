-- Public portfolio link code per user (existing users each get their own random value).
ALTER TABLE "User" ADD COLUMN "portfolioToken" TEXT NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, '');
CREATE UNIQUE INDEX "User_portfolioToken_key" ON "User"("portfolioToken");

-- Portfolio images (max 20 per user, enforced in the app).
CREATE TABLE "PortfolioImage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioImage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PortfolioImage_userId_order_idx" ON "PortfolioImage"("userId", "order");
ALTER TABLE "PortfolioImage" ADD CONSTRAINT "PortfolioImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
