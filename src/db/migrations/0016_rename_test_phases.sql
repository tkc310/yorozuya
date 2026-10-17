-- テストの工程名を変える。単テスト→ユニットテスト、結テスト→結合テスト、総テスト→e2eテスト。
UPDATE `career_phases` SET `phase` = 'ユニットテスト' WHERE `phase` = '単テスト';--> statement-breakpoint
UPDATE `career_phases` SET `phase` = '結合テスト' WHERE `phase` = '結テスト';--> statement-breakpoint
UPDATE `career_phases` SET `phase` = 'e2eテスト' WHERE `phase` = '総テスト';
