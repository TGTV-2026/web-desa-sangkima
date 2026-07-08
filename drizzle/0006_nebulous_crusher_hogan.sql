CREATE TABLE `news` (
	`id` varchar(128) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` varchar(500),
	`content` text,
	`cover_image` varchar(500),
	`published` boolean NOT NULL DEFAULT true,
	`published_at` timestamp DEFAULT (now()),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `news_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
