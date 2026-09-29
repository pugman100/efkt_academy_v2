-- PDF course modules: a module can play an uploaded PDF document.
ALTER TYPE "ModuleSource" ADD VALUE 'PDF';
ALTER TABLE "Module" ADD COLUMN "fileId" TEXT;
