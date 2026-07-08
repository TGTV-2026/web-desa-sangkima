CREATE TABLE `products` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`price` int NOT NULL DEFAULT 0,
	`unit` varchar(40),
	`category` varchar(60),
	`image` varchar(500),
	`published` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
