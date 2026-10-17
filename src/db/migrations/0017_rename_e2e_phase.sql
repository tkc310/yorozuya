-- e2eテストの工程名を、英字を大文字にした E2Eテスト に変える。
UPDATE `career_phases` SET `phase` = 'E2Eテスト' WHERE `phase` = 'e2eテスト';
