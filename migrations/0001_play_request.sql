-- Migration number: 0001 	 2025-08-26T11:10:18.971Z

CREATE TABLE "play_request" (
	"id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
	"ip" text,
	"ua" text,
	"device_id" text,
	"media_source_id" text,
	"emos_url" text,
	"api_key" text,
	"time" date
);
CREATE INDEX "play_request_device_id" ON "play_request" ("device_id" ASC);
CREATE INDEX "play_request_ip" ON "play_request" ("ip" ASC);
CREATE INDEX "play_request_media_source_id" ON "play_request" ("media_source_id" ASC);
CREATE INDEX "play_request_time" ON "play_request" ("time" ASC);
