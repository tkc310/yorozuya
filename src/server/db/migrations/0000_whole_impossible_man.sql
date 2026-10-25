CREATE TABLE `career_environments` (
	`career_id` text NOT NULL,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`career_id`, `position`)
);
--> statement-breakpoint
CREATE TABLE `career_phases` (
	`career_id` text NOT NULL,
	`position` integer NOT NULL,
	`phase` text NOT NULL,
	PRIMARY KEY(`career_id`, `position`)
);
--> statement-breakpoint
CREATE TABLE `career_tools` (
	`career_id` text NOT NULL,
	`position` integer NOT NULL,
	`name` text NOT NULL,
	PRIMARY KEY(`career_id`, `position`)
);
--> statement-breakpoint
CREATE TABLE `careers` (
	`id` text PRIMARY KEY NOT NULL,
	`start_year` integer NOT NULL,
	`start_month` integer NOT NULL,
	`end_year` integer,
	`end_month` integer,
	`project_name` text NOT NULL,
	`summary` text NOT NULL,
	`work` text NOT NULL,
	`outcome` text NOT NULL,
	`role` text NOT NULL,
	`employment` text NOT NULL,
	`position_name` text NOT NULL,
	`team` text NOT NULL,
	`methodology` text NOT NULL,
	`parallel` integer NOT NULL,
	`hard` integer NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_year` integer,
	`updated_month` integer,
	`name` text NOT NULL,
	`work_style` text NOT NULL,
	`education` text NOT NULL,
	`station` text NOT NULL,
	`self_pr` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skill_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL
);
