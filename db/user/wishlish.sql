-- 會員追蹤商品清單表（wishlist）建表
DROP TABLE `wishlist`;
USE restful;
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    products_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (products_id) REFERENCES products(id)
);

