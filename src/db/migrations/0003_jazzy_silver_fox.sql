ALTER TABLE `profiles` ADD `age` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `gender` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `experience_months` integer;