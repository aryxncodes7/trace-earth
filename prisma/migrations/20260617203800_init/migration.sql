-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "name" TEXT,
    "image" TEXT,
    "city" TEXT,
    "country" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "targetKgPerDay" DOUBLE PRECISION NOT NULL DEFAULT 13.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transportKg" DOUBLE PRECISION NOT NULL,
    "energyKg" DOUBLE PRECISION NOT NULL,
    "dietKg" DOUBLE PRECISION NOT NULL,
    "shoppingKg" DOUBLE PRECISION NOT NULL,
    "totalKg" DOUBLE PRECISION NOT NULL,
    "aiTipCache" TEXT,
    "aiTipGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
