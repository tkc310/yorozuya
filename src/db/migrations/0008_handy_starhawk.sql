ALTER TABLE `skills` ADD `experience_auto` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- これまで手入力が無い技術は職務経歴から数えていたので、自動計算を有効にしておく。
UPDATE `skills` SET `experience_auto` = 1 WHERE `experience_months` IS NULL;