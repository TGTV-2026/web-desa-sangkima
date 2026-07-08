CREATE TABLE `cms_users` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('super_admin','editor') NOT NULL DEFAULT 'editor',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `cms_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `news` ADD `author_id` varchar(128);--> statement-breakpoint
ALTER TABLE `news` ADD `author_name` varchar(255);--> statement-breakpoint
ALTER TABLE `ppid_documents` ADD `author_id` varchar(128);--> statement-breakpoint
ALTER TABLE `ppid_documents` ADD `author_name` varchar(255);