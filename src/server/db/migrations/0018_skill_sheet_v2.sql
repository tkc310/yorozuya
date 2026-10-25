-- 版 2: フリガナ・肩書・稼働条件・ハイライト・資格・主要スキルを足し、得意な技術・業務をハイライトに移す。
CREATE TABLE `profile_highlights` (
	`position` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile_qualifications` (
	`position` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `name_kana` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `name_initials` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `name_display` text DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `available_from` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `desired_rate` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `work_style` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `show_available_from` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `show_desired_rate` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `show_work_style` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `show_highlights` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `skills` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- 得意な技術・得意な業務を、空でなければハイライトの 1 件目・2 件目に移す。
INSERT INTO `profile_highlights` (`position`, `text`)
	SELECT 0, trim(`strong_skills`) FROM `profiles` WHERE trim(`strong_skills`) <> '' LIMIT 1;--> statement-breakpoint
INSERT INTO `profile_highlights` (`position`, `text`)
	SELECT (SELECT count(*) FROM `profile_highlights`), trim(`strong_work`) FROM `profiles` WHERE trim(`strong_work`) <> '' LIMIT 1;--> statement-breakpoint
ALTER TABLE `profiles` DROP COLUMN `strong_skills`;--> statement-breakpoint
ALTER TABLE `profiles` DROP COLUMN `strong_work`;
