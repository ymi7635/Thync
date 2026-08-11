-- 檢視表：一次查詢商品對應的主圖 id 與介紹圖 id
-- 方便直接查詢「商品 + 主圖 + 介紹圖」三者對應關係的視圖(VIEW)
-- 不會另外佔一份儲存空間，SELECT 的當下才即時去 JOIN products_imgs / products_intro_imgs，
-- 所以圖片有新增/刪除，這個視圖查出來的結果永遠是最新的，不用重新匯入。
USE restful;

CREATE OR REPLACE VIEW products_with_images AS
SELECT
    p.id,
    p.name,
    p.price,
    p.category_main_id,
    p.category_sub_id,
    p.brand_id,
    p.is_valid,
    -- 主圖（products_imgs，商品頁輪播用）
    GROUP_CONCAT(DISTINCT pi.id ORDER BY pi.id) AS image_ids,
    GROUP_CONCAT(DISTINCT pi.file ORDER BY pi.id SEPARATOR ', ') AS image_files,
    COUNT(DISTINCT pi.id) AS image_count,
    -- 介紹圖（products_intro_imgs，商品詳情「介紹說明」段落用）
    GROUP_CONCAT(DISTINCT ii.id ORDER BY ii.id) AS intro_image_ids,
    GROUP_CONCAT(DISTINCT ii.file ORDER BY ii.id SEPARATOR ', ') AS intro_image_files,
    COUNT(DISTINCT ii.id) AS intro_image_count
FROM products p
LEFT JOIN products_imgs pi ON pi.product_id = p.id
LEFT JOIN products_intro_imgs ii ON ii.product_id = p.id
GROUP BY p.id;
