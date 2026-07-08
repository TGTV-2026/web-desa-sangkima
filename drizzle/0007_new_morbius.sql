CREATE TABLE `ppid_documents` (
	`id` varchar(128) NOT NULL,
	`category` varchar(24) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(500),
	`file_url` varchar(500),
	`external_url` varchar(500),
	`year` varchar(9),
	`published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ppid_documents_id` PRIMARY KEY(`id`)
);
