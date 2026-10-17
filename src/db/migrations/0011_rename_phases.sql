-- 担当工程を 8 区分にする。運用と保守は保守運用に、テストは単テストにまとめる。
DELETE FROM `career_phases` WHERE `phase` = '保守' AND `career_id` IN (SELECT `career_id` FROM `career_phases` WHERE `phase` = '運用');--> statement-breakpoint
UPDATE `career_phases` SET `phase` = '保守運用' WHERE `phase` IN ('運用', '保守');--> statement-breakpoint
UPDATE `career_phases` SET `phase` = '単テスト' WHERE `phase` = 'テスト';
