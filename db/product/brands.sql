-- 商品品牌表建表 + 種子資料
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-09-02 04:17:42
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
-- 資料表結構 `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `brands`
--

INSERT INTO `brands` (`id`, `name`) VALUES
(1, 'A4tech 雙飛燕'),
(2, 'AIRPULSE'),
(3, 'AOC'),
(4, 'Arbiter Studio'),
(5, 'ASUS 華碩'),
(6, 'Avermedia圓剛'),
(7, 'AZIO'),
(8, 'BenQ'),
(9, 'CHERRY櫻桃'),
(10, 'CoolerMaster 酷碼'),
(11, 'CORSAIR海盜船'),
(12, 'Cougar'),
(13, 'Cryorig 快睿'),
(14, 'DIGIFAST迅華'),
(15, 'Dream Gamer逐夢者'),
(16, 'Ducky'),
(17, 'Edifier漫步者'),
(18, 'EIZO'),
(19, 'Elgato'),
(20, 'Endgame Gear'),
(21, 'EPOS'),
(22, 'Ergotron'),
(23, 'FBB'),
(24, 'FILCO'),
(25, 'Final'),
(26, 'Fractal Design'),
(27, 'Gateron佳達隆'),
(28, 'Gigabyte 技嘉'),
(29, 'Glorious'),
(30, 'GravaStar'),
(31, 'Helix Lab'),
(32, 'HyperX'),
(33, 'I-ROCKS 艾芮克'),
(34, 'JBL'),
(35, 'JONSBO 喬思伯'),
(36, 'Kailh凱華'),
(37, 'KBParadise'),
(38, 'Kelowna'),
(39, 'Keychron'),
(40, 'Keytok'),
(41, 'LianLi 聯力'),
(42, 'LINDY 林帝'),
(43, 'Mostly默思利'),
(44, 'Moyu.studio'),
(45, 'MSI GAMING 微星'),
(46, 'Noctua 貓頭鷹'),
(47, 'NZXT'),
(48, 'OTHER其他'),
(49, 'Padsmith'),
(50, 'Pulsar'),
(51, 'Razer 雷蛇'),
(52, 'ROYAL KLUDGE'),
(53, 'SAMSUNG 三星'),
(54, 'Sennheiser森海塞爾'),
(55, 'SHURE'),
(56, 'SilverStone 銀欣'),
(57, 'StarDust 星塵'),
(58, 'SteelSeries 賽睿'),
(59, 'SuperLux 舒伯樂'),
(60, 'Thermalright 利民'),
(61, 'Thermaltake 曜越'),
(62, 'Traitors背骨玩家'),
(63, 'TTC'),
(64, 'Vortex'),
(65, 'ZOWIE'),
(66, '火炎森美');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
