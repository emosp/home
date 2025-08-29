-- Migration number: 0002 	 2025-08-26T17:43:26.315Z

CREATE TABLE "play_history" (
	"id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
	"play_session_id" text,
	"media_source_id" text,
	"event_name" text,
	"position_ticks" text,
	"time" date
);
CREATE INDEX "play_history_play_session_id" ON "play_history" ("play_session_id" ASC);
CREATE INDEX "play_history_media_source_id" ON "play_history" ("media_source_id" ASC);
CREATE INDEX "play_history_time" ON "play_history" ("time" ASC);