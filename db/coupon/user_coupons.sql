-- 會員持有優惠券對照表建表
CREATE DATABASE restful;

use restful;

CREATE TABLE user_coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_id INT NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    attr ENUM('force', 'manual') NOT NULL DEFAULT 'manual'
);

-- 測試用 Query to get all coupons for a specific user (user_id = 113)
SELECT 
  uc.id AS user_coupon_id,
  uc.user_id,
  uc.coupon_id,
  uc.is_used,
  uc.used_at,
  uc.created_at AS assigned_at,
  c.code,
  c.`desc`,
  c.start_at,
  c.expires_at,
  c.is_active,
  c.is_valid
FROM user_coupons uc
JOIN coupon c ON uc.coupon_id = c.id
WHERE uc.user_id = 113;

-- 測試「已使用」的情境
UPDATE user_coupons
SET is_used = 1, used_at = NOW()
WHERE user_id = 115 AND coupon_id = (SELECT id FROM coupon WHERE code = 'C001');

-- 測試「已過期」的情境
UPDATE coupon
SET expires_at = '2024-01-01 00:00:00'
WHERE code = 'C002';

SELECT * FROM users WHERE id = 124;

SELECT * 
FROM user_coupons uc
JOIN coupon c ON uc.coupon_id = c.id
WHERE uc.user_id = 115 AND c.code = 'C002';