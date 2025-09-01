CREATE TABLE `play_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`play_session_id` text,
	`media_source_id` text,
	`event_name` text,
	`position_ticks` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `play_history_play_session_id` ON `play_history` (`play_session_id`);--> statement-breakpoint
CREATE INDEX `play_history_media_source_id` ON `play_history` (`media_source_id`);--> statement-breakpoint
CREATE INDEX `play_history_timestamp` ON `play_history` (`timestamp`);--> statement-breakpoint
CREATE TABLE `play_request` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text,
	`ua` text,
	`device_id` text,
	`media_source_id` text,
	`emos_data` text,
	`api_key` text,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `play_request_device_id` ON `play_request` (`device_id`);--> statement-breakpoint
CREATE INDEX `play_request_media_source_id` ON `play_request` (`media_source_id`);--> statement-breakpoint
CREATE INDEX `play_request_timestamp` ON `play_request` (`timestamp`);