ALTER TABLE "MetadataValue" DROP CONSTRAINT "MetadataValue_pkey";

ALTER TABLE "MetadataValue" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "MetadataValue" ALTER COLUMN "id" TYPE TEXT USING "id"::TEXT;

ALTER TABLE "MetadataValue" ADD PRIMARY KEY ("id");

DROP SEQUENCE IF EXISTS "MetadataValue_id_seq";
