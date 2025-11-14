-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('EVENT', 'COMMAND', 'QUERY', 'REPLY', 'ERROR');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "users_view" (
    "_id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_view_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "outbox_messages" (
    "_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "start_processing_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "retry" INTEGER,
    "error" TEXT,

    CONSTRAINT "outbox_messages_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "inbox_messages" (
    "_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "status" "MessageStatus" NOT NULL,
    "start_processing_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "retry" INTEGER,
    "error" TEXT,

    CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "events_store" (
    "_id" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "state" JSONB NOT NULL,

    CONSTRAINT "events_store_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "events_snaphost" (
    "_id" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_snaphost_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "outbox_messages_status_idx" ON "outbox_messages"("status");

-- CreateIndex
CREATE INDEX "outbox_messages_start_processing_at_idx" ON "outbox_messages"("start_processing_at");

-- CreateIndex
CREATE INDEX "outbox_messages_type_idx" ON "outbox_messages"("type");

-- CreateIndex
CREATE INDEX "inbox_messages_status_idx" ON "inbox_messages"("status");

-- CreateIndex
CREATE INDEX "inbox_messages_start_processing_at_idx" ON "inbox_messages"("start_processing_at");

-- CreateIndex
CREATE INDEX "inbox_messages_type_idx" ON "inbox_messages"("type");

-- CreateIndex
CREATE INDEX "events_store_aggregate_id_idx" ON "events_store"("aggregate_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_store_aggregate_id_version_key" ON "events_store"("aggregate_id", "version");

-- CreateIndex
CREATE INDEX "events_snaphost_aggregate_id_idx" ON "events_snaphost"("aggregate_id");
