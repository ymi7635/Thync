-- 【後台】管理者帳號表建表 + 預設帳號種子資料
-- 後台管理者帳號表
-- 跟一般會員（users）完全分離，避免管理者權限跟會員資料耦合在一起
USE restful;

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `account` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,   -- bcrypt 雜湊值，不存明碼
  `name` VARCHAR(50) DEFAULT NULL,
  `is_valid` TINYINT NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 預設管理者帳號，密碼已用 bcrypt 雜湊，明碼原文刻意不寫在任何檔案裡（避免這份 SQL
-- 之後被公開推上 GitHub 時，任何人都能直接看到管理者密碼）。
-- 如果你是新環境第一次建立、忘記密碼，或想換一組新密碼，用下面指令重新產生：
--   node -e "import('bcrypt').then(b=>b.default.hash('你的新密碼',10).then(console.log))"
-- 再用 UPDATE admins SET password = '產生出來的雜湊值' WHERE account = 'admin'; 覆蓋即可。
INSERT INTO `admins` (`account`, `password`, `name`) VALUES
('admin', '$2b$10$I9wWKT5YGvmB1xb5ufTJx.wN1tW7rikxKGturLsqpiIxcFQLUvd66', '系統管理員');
