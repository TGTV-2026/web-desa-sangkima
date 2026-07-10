ALTER TABLE `cms_user_tokens` MODIFY COLUMN `type` enum('EmailVerify','EmailChange','PasswordReset') NOT NULL;--> statement-breakpoint
ALTER TABLE `cms_users` ADD `email_verified_at` datetime;