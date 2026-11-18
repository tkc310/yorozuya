-- 作業報告書: 稼働日設定・月ごとの精算幅・日ごとの入力。
CREATE TABLE `work_report_days` (
	`date` text PRIMARY KEY NOT NULL,
	`start` integer,
	`end` integer,
	`break_minutes` integer DEFAULT 0 NOT NULL,
	`override` text DEFAULT 'none' NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work_report_months` (
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`min_minutes` integer,
	`max_minutes` integer,
	PRIMARY KEY(`year`, `month`)
);
--> statement-breakpoint
CREATE TABLE `work_report_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`sun_minutes` integer DEFAULT 0 NOT NULL,
	`mon_minutes` integer DEFAULT 480 NOT NULL,
	`tue_minutes` integer DEFAULT 480 NOT NULL,
	`wed_minutes` integer DEFAULT 480 NOT NULL,
	`thu_minutes` integer DEFAULT 480 NOT NULL,
	`fri_minutes` integer DEFAULT 480 NOT NULL,
	`sat_minutes` integer DEFAULT 0 NOT NULL,
	`holidays_off` integer DEFAULT true NOT NULL,
	`default_start` integer DEFAULT 600 NOT NULL,
	`default_break` integer DEFAULT 60 NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`client` text DEFAULT '' NOT NULL,
	`project` text DEFAULT '' NOT NULL
);
