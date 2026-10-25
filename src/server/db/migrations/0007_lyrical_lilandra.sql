ALTER TABLE `profiles` ADD `updated_day` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `updated_auto` integer DEFAULT false NOT NULL;