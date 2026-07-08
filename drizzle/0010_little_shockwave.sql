CREATE TABLE `gallery_albums` (
	`id` varchar(128) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500),
	`cover_image` varchar(500),
	`published` boolean NOT NULL DEFAULT true,
	`author_id` varchar(128),
	`author_name` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_albums_id` PRIMARY KEY(`id`),
	CONSTRAINT `gallery_albums_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `gallery_photos` (
	`id` varchar(128) NOT NULL,
	`album_id` varchar(128) NOT NULL,
	`url` varchar(500) NOT NULL,
	`caption` varchar(300),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `gallery_photos_id` PRIMARY KEY(`id`)
);
