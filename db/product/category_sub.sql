-- 商品子分類表建表 + 種子資料
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-09-02 04:24:39
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `restful`
--

-- --------------------------------------------------------

--
-- 資料表結構 `category_sub`
--

CREATE TABLE `category_sub` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `main_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `category_sub`
--

INSERT INTO `category_sub` (`id`, `name`, `main_id`) VALUES
(1, '機械式鍵盤', 1),
(2, '薄膜式鍵盤', 1),
(3, '類機械式鍵盤', 1),
(4, '鍵盤手托｜手靠墊', 1),
(5, '鍵帽', 1),
(6, '軸體', 1),
(7, '潤軸｜手工具', 1),
(8, '組裝週邊│線材', 1),
(9, '電競滑鼠', 2),
(10, '文書滑鼠', 2),
(11, '滑鼠墊', 2),
(12, '耳機｜耳機麥克風', 3),
(13, '喇叭｜音響', 3),
(14, '麥克風', 3),
(15, '音效卡｜擴大機', 3),
(16, '傳輸線｜音源線│轉接頭', 3),
(17, '機殼｜裸測架', 4),
(18, '風扇｜散熱', 4),
(19, '電源供應器', 4),
(20, '螢幕顯示器', 5),
(21, '螢幕架', 5),
(22, '視訊設備│擷取盒', 5),
(23, '影音線材｜轉接延長器', 5);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `category_sub`
--
ALTER TABLE `category_sub`
  ADD PRIMARY KEY (`id`),
  ADD KEY `main_id` (`main_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `category_sub`
--
ALTER TABLE `category_sub`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
