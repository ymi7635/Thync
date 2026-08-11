-- 訂單主表與訂單明細表建表（orders / order_items）
-- Active: 1747620417947@@localhost@3306@restful
USE restful;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numerical_order VARCHAR(32) NOT NULL COMMENT '對外顯示的訂單編號；可用日期+流水或UUID短碼',
  user_id INT NOT NULL COMMENT '下單者',
  -- 收/配送
  delivery_method VARCHAR(20) DEFAULT NULL COMMENT 'home, store_pickup...（可為空）',
  delivery_store VARCHAR(50) DEFAULT NULL COMMENT '取貨門市',
  delivery_address VARCHAR(255) DEFAULT NULL,
  recipient VARCHAR(50) DEFAULT NULL COMMENT '收件人',
 -- 付款
  pay_method VARCHAR(20) NOT NULL COMMENT 'credit_card, linepay, atm 等',
  recipient_phone VARCHAR(10) DEFAULT NULL COMMENT '收件人電話',
  pay_info VARCHAR(100) DEFAULT NULL COMMENT '金流交易編號/回傳代碼等；不存卡號與CVV',
  status_now VARCHAR(16) NOT NULL COMMENT 'pending | paid | failed',
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- 金額快照
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '商品小計（未扣任何折扣）',
  coupons_id INT DEFAULT NULL COMMENT '使用的優惠券，若無則為NULL',
  discount_info TEXT DEFAULT NULL COMMENT 'JSON快照：折扣類型/門檻/代碼/折抵金額等',
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '應付 = total - 折扣 + 運費(若有)',
  paid_at DATETIME DEFAULT NULL COMMENT '成功時間（paid 才有值）',
  -- 索引
  UNIQUE KEY uq_numerical_order (numerical_order),
  KEY idx_user_id (user_id),
  KEY idx_status_now (status_now),
  -- 外鍵
  FOREIGN KEY (user_id) REFERENCES users(id)
  -- FOREIGN KEY (coupons_id) REFERENCES coupon(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '當下商品單價快照',
  -- 外鍵
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE order_items
DROP FOREIGN KEY order_items_ibfk_2;

ALTER TABLE order_items
ADD CONSTRAINT order_items_ibfk_2
FOREIGN KEY (product_id) REFERENCES products(id);

