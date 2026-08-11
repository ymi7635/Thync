-- 會員收藏文章對照表建表
-- Active: 1747620417947@@localhost@3306@restful
DROP TABLE `article_favorites`;
USE restful;
CREATE TABLE article_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    articles_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (articles_id) REFERENCES articles(id)
);

SHOW ENGINE INNODB STATUS\G
