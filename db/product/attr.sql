-- 商品屬性表（attributes）與屬性值表（attribute_option）建表 + 種子資料
-- Active: 1747618801539@@127.0.0.1@3306@restful
CREATE TABLE attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- 屬性 ID
    name VARCHAR(100) NOT NULL,         -- 屬性名稱
    main_id INT NOT NULL,               -- 對應母分類 ID
    FOREIGN KEY (main_id) REFERENCES category_main(id)  -- 關聯到母分類
);

INSERT INTO attributes (name, main_id) VALUES
-- (1) 鍵盤｜鍵帽｜鍵盤周邊
('鍵盤尺寸', 1),
('鍵盤材質', 1),
('印字方式', 1),
('鍵帽配置', 1),
('鍵帽語系', 1),
('軸體手感', 1),
('工作原理', 2),
('按鍵數', 2),
('鼠墊表面材質', 2),
('鼠墊大小', 2),
('耳罩材質', 3),
('連接介面', 3),
('聲道', 3),
('指向性型式', 3),
('風扇尺寸', 4),
('風扇燈光', 4),
('空冷散熱器', 4),
('機殼類型', 4),
('電源瓦數', 4),
('螢幕尺寸', 5),
('面板類型', 5),
('最高解析度', 5),
('螢幕更新率', 5),
('螢幕接頭擴充', 5);

CREATE TABLE attribute_option (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- 屬性值 ID
    attribute_id INT NOT NULL,                 -- 對應 attributes.id
    value VARCHAR(100) NOT NULL,               -- 屬性值
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
);

INSERT INTO attribute_option (attribute_id, value) VALUES
(1, '100%'), (1, '96%'), (1, '80%'), (1, '75%'), (1, '65%'), (1, '60%'), (1, '數字鍵盤'),
(2, 'ABS'), (2, 'PBT'), (2, 'PC'), (2, '金屬'), (2, '樹脂'),
(3, '二色成形'), (3, '雷雕'), (3, '油墨'), (3, '熱昇華'), (3, 'UV 個性鍵帽'),
(4, '單顆'), (4, '增補'), (4, '60%-80%(61~103鍵)'), (4, '標準(104-108鍵)'),
(5, '英文'), (5, '中文'), (5, '日文'), (5, '韓文'),
(6, '段落有聲'), (6, '段落無聲'), (6, '線性無聲'), (6, '提前段落'), (6, '靜音'), (6, '多規格'),
(7, '光學'), (7, '雷射'), (7, '其他'),
(8, '3顆'), (8, '5顆'), (8, '5顆以上'), (8, '其他'),
(9, '布質'), (9, '塑膠'), (9, '玻璃'), (9, '皮質'),
(10, 'S'), (10, 'M'), (10, 'L'),
(11, '布質'), (11, '皮質'), (11, '蛋白質皮質'), (11, '其他'), (11, 'NA'),
(12, '3.5mm'), (12, 'USB'), (12, 'Type-C'), (12, '4.4mm 6.3mm'), (12, '多規格'),
(13, '雙聲道'), (13, '5.1聲道'), (13, '7.1聲道'), (13, '其他'),
(14, '多指向'), (14, '心型'), (14, '超心型'), (14, '全指向'), (14, '雙指向'),
(15, '4cm'), (15, '8cm'), (15, '9cm'), (15, '12cm'), (15, '14cm'), (15, '18cm'), (15, '20cm'), (15, '薄型風扇'),
(16, 'RGB(4pin)'), (16, 'A.RGB(3pin)'), (16, 'RGB燈光(需控制器)'),
(17, '塔式'), (17, '下吹式'), (17, '顯示卡散熱'), (17, '記憶體散熱'), (17, 'SSD散熱'),
(18, '小型機殼'), (18, '中直立式'), (18, '靜音型'), (18, '伺服器大型'), (18, '玻璃|透側型'), (18, '裸測架'),
(19, '450瓦以下'), (19, '451-650瓦'), (19, '651-850瓦'), (19, '851以上'),
(20, '24吋以下'), (20, '24吋'), (20, '27吋'), (20, '27~32吋'), (20, '32吋以上'),
(21, 'TN'), (21, 'VA'), (21, 'IPS'), (21, 'OLED'),
(22, '5120 x 2160 (21:9)'), (22, '5120 x 1440 (32:9)'), (22, '3840 x 2160 (4K)'), 
(22, '3840 x 1600 (21:9)'), (22, '3440 x 1440 (21:9)'), (22, '3840 x 1080 (32:9)'), 
(22, '2560 x 1080 (21:9)'), (22, '2560 x 1440 (2K)'), (22, '1920 x 1200'), (22, '1920 x 1080'),
(23, '60Hz~100Hz'), (23, '120Hz~144Hz'), (23, '145Hz~240Hz'), (23, '241Hz~360Hz'),
(24, 'HDMI'), (24, 'DisplayPort(DP)'), (24, 'DVI'), (24, 'D-sub(VGA)'), (24, 'USB'), (24, 'HUB功能');

CREATE TABLE products_attribute_values (
    product_id INT NOT NULL,
    attribute_id INT NOT NULL,
    option_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (attribute_id) REFERENCES attributes(id),
    FOREIGN KEY (option_id) REFERENCES attribute_option(id)
);

DROP TABLE products_attribute_values;

SELECT 
    pav.product_id,
    p.name AS product_name,
    a.name AS attribute_name,
    ao.value AS option_value
FROM products_attribute_values pav
JOIN products p ON pav.product_id = p.id
JOIN attributes a ON pav.attribute_id = a.id
JOIN attribute_option ao ON pav.option_id = ao.id
LIMIT 20;


INSERT INTO attribute_option (attribute_id, value) VALUES
(14, '單指向'), (14, '藍牙'),(12, '2.4GHz');