-- New image bytes live in the Neon Object Storage "uploads" bucket (images/<id>).
-- Older rows keep their bytes here and are still served from Postgres.
ALTER TABLE "FileUpload" ALTER COLUMN "data" DROP NOT NULL;
