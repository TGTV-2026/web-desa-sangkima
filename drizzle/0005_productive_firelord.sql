CREATE TABLE `site_content` (
	`key` varchar(64) NOT NULL,
	`value` json,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` varchar(128),
	CONSTRAINT `site_content_key` PRIMARY KEY(`key`)
);
