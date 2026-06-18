ALTER TABLE `letter_requests` ADD `attachments` json;--> statement-breakpoint
ALTER TABLE `letter_requests` ADD CONSTRAINT `letter_requests_letter_number_unique` UNIQUE(`letter_number`);