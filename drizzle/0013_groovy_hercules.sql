CREATE TABLE `cms_user_tokens` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`cms_user_id` varchar(128) NOT NULL,
	`token` varchar(255) NOT NULL,
	`type` enum('EmailChange','PasswordReset') NOT NULL,
	`meta` json,
	`expires_at` timestamp NOT NULL,
	`used_at` datetime,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `cms_user_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `cms_user_tokens` ADD CONSTRAINT `cms_user_tokens_cms_user_id_cms_users_id_fk` FOREIGN KEY (`cms_user_id`) REFERENCES `cms_users`(`id`) ON DELETE no action ON UPDATE no action;