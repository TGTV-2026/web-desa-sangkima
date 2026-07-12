CREATE TABLE `rt_report_sessions` (
	`id` varchar(128) NOT NULL,
	`tahun` int NOT NULL,
	`bulan` tinyint NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(128) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`closed_at` datetime,
	CONSTRAINT `rt_report_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_sesi_tahun_bulan` UNIQUE(`tahun`,`bulan`)
);
--> statement-breakpoint
CREATE TABLE `rt_reports` (
	`id` varchar(128) NOT NULL,
	`session_id` varchar(128) NOT NULL,
	`cms_user_id` varchar(128) NOT NULL,
	`dusun` varchar(100) NOT NULL,
	`rt` varchar(10) NOT NULL,
	`data` json,
	`dikumpulkan_pada` timestamp NOT NULL DEFAULT (now()),
	`diperbarui_pada` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rt_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_laporan_sesi_user` UNIQUE(`session_id`,`cms_user_id`)
);
--> statement-breakpoint
ALTER TABLE `cms_users` MODIFY COLUMN `role` enum('super_admin','editor','rt') NOT NULL DEFAULT 'editor';--> statement-breakpoint
ALTER TABLE `cms_users` ADD `dusun` varchar(100);--> statement-breakpoint
ALTER TABLE `cms_users` ADD `rt` varchar(10);--> statement-breakpoint
ALTER TABLE `cms_users` ADD `must_change_password` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `rt_report_sessions` ADD CONSTRAINT `rt_report_sessions_created_by_cms_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `cms_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rt_reports` ADD CONSTRAINT `rt_reports_session_id_rt_report_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `rt_report_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rt_reports` ADD CONSTRAINT `rt_reports_cms_user_id_cms_users_id_fk` FOREIGN KEY (`cms_user_id`) REFERENCES `cms_users`(`id`) ON DELETE no action ON UPDATE no action;