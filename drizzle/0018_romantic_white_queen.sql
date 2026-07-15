ALTER TABLE `letter_types` RENAME COLUMN `require_letter_number` TO `require_manual_number`;--> statement-breakpoint
ALTER TABLE `letter_types` MODIFY COLUMN `require_manual_number` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `letter_types` ADD `deleted_at` datetime;