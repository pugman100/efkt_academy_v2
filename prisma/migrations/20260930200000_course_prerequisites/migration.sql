-- Course prerequisites (unlock after completing another course, optional delay) and unlock emails.
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "prerequisiteId" TEXT,
ADD COLUMN     "prerequisiteSetAt" TIMESTAMP(3),
ADD COLUMN     "unlockDelayDays" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CourseUnlock" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseUnlock_pkey" PRIMARY KEY ("userId","courseId")
);

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseUnlock" ADD CONSTRAINT "CourseUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseUnlock" ADD CONSTRAINT "CourseUnlock_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

