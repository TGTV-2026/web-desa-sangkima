CREATE TABLE `activity_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`actor_type` enum('warga','cms','system') NOT NULL,
	`actor_id` varchar(128),
	`actor_name` varchar(255),
	`action` varchar(64) NOT NULL,
	`target_type` varchar(40),
	`target_id` varchar(128),
	`summary` varchar(500) NOT NULL,
	`metadata` json,
	`ip_address` varchar(45),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_activity_actor` ON `activity_logs` (`actor_type`,`actor_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_action` ON `activity_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_activity_created` ON `activity_logs` (`created_at`);