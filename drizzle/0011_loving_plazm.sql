CREATE TABLE `gallery_videos` (
	`id` varchar(128) NOT NULL,
	`album_id` varchar(128) NOT NULL,
	`platform` enum('youtube','instagram') NOT NULL,
	`external_id` varchar(128) NOT NULL,
	`url` varchar(500) NOT NULL,
	`caption` varchar(300),
	`thumbnail_url` varchar(500),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `gallery_videos_id` PRIMARY KEY(`id`)
);
