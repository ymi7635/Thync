# Thync — 3C 週邊電商網站

> **Think what hearts can see, Sync where minds run free.**

Thync 是一個全端 3C 周邊電商網站，販售鍵盤、滑鼠、音響設備、機殼、螢幕等商品，同時提供文章分享、會員系統、購物車、優惠券，以及一套完整的**後台管理系統**（商品／訂單／會員／優惠券／文章 CRUD）。

---

## 📖 目錄

- [這是一個什麼樣的專案？](#這是一個什麼樣的專案)
- [技術架構](#技術架構)
- [完整檔案結構](#完整檔案結構)
- [開始使用（給第一次接觸的人）](#開始使用給第一次接觸的人)
  - [第一步：安裝必要工具](#第一步安裝必要工具)
  - [第二步：下載專案（Clone）](#第二步下載專案clone)
  - [第三步：建立資料庫並匯入 SQL（重要：順序不可錯）](#第三步建立資料庫並匯入-sql重要順序不可錯)
  - [第四步：安裝前後端套件](#第四步安裝前後端套件)
  - [第五步：設定環境變數](#第五步設定環境變數)
  - [第六步：啟動專案](#第六步啟動專案)
  - [第七步：打開網站](#第七步打開網站)
- [後台管理系統](#後台管理系統)
- [資料表關聯總覽](#資料表關聯總覽)
- [圖片與檔案上傳規則](#圖片與檔案上傳規則)
- [常見問題 / 疑難排解](#常見問題--疑難排解)

---

## 這是一個什麼樣的專案？

**前台（一般使用者）**
- 🛒 瀏覽商品（鍵盤、滑鼠、耳機/喇叭、機殼、螢幕），依分類/品牌/價格/屬性篩選
- 📝 閱讀 3C 相關文章，依分類/標籤篩選
- 👤 註冊/登入會員（含 Google 登入）、忘記密碼、修改資料
- ❤️ 收藏商品（追蹤清單）、收藏文章
- 🛍️ 購物車、結帳（綠界 ECPay 金流、7-11/全家超商取貨）
- 🏷️ 優惠券折抵

**後台（管理者）**
- 📦 商品管理：新增／編輯／上下架，商品主圖與介紹圖各自獨立管理
- 📋 訂單管理：查看訂單明細、更新訂單狀態（待付款／已付款／失敗）
- 👥 會員管理：查看會員列表、啟用／停權帳號
- 🏷️ 優惠券管理：新增／編輯／刪除
- 📰 文章管理：新增／編輯／軟刪除／垃圾桶

---

## 技術架構

| 層級 | 技術 |
|:---|:---|
| 前端框架 | Next.js 15（App Router）+ React 19 |
| UI 套件 | Bootstrap 5 + react-bootstrap |
| 圖示 | FontAwesome 6 |
| 動畫/提示 | SweetAlert2、react-toastify、Lottie |
| CSS 預處理 | Sass |
| 後端框架 | Express 5 |
| 資料庫 | MySQL / MariaDB |
| 連線套件 | mysql2（promise 版） |
| 圖檔上傳 | Multer |
| 一般會員認證 | JWT（jsonwebtoken）+ bcrypt |
| 後台管理者認證 | 獨立的 JWT（`role: "admin"`），跟會員 token 完全分開 |
| Google 登入 | google-auth-library |
| 寄信服務 | Nodemailer（Gmail SMTP） |
| 金流 | 綠界 ECPay |
| 物流 | 全家 / 7-11 超商取貨 API |

---

## 完整檔案結構

```
Thync-main/
├── client/                          # 前端（Next.js）
│   ├── app/
│   │   ├── admin/                   # 【後台管理系統】
│   │   │   ├── login/page.js        #   後台登入頁（打 /api/admin/login）
│   │   │   ├── layout.js            #   包住整個 /admin/* 的 AdminAuthProvider
│   │   │   ├── page.js              #   後台首頁（儀表板，5 個功能卡片）
│   │   │   ├── products/            #   商品管理
│   │   │   │   ├── page.js          #     列表（單畫面不捲動，只有表格內部捲動）
│   │   │   │   ├── productForm.js   #     新增/編輯共用表單（主圖＋介紹圖各自上傳）
│   │   │   │   ├── create/page.js
│   │   │   │   └── edit/[id]/page.js
│   │   │   ├── orders/page.js       #   訂單管理（單畫面不捲動）
│   │   │   ├── users/page.js        #   會員管理
│   │   │   ├── coupons/page.js      #   優惠券管理（新增/編輯用彈窗）
│   │   │   └── articles/            #   文章管理（既有功能，已補上權限保護）
│   │   │       ├── page.js
│   │   │       ├── create/page.js
│   │   │       ├── edit/[id]/page.js
│   │   │       └── trash/page.js
│   │   ├── articles/                # 前台文章列表/詳情
│   │   ├── cart/                    # 購物車、結帳、物流、付款成功頁
│   │   ├── coupons/                 # 前台優惠券頁
│   │   ├── ecpay/                   # 綠界金流 callback / api
│   │   ├── products/                # 前台商品列表/品牌/特價/詳情
│   │   ├── user/                    # 會員（登入、註冊、收藏、訂單…）
│   │   ├── _components/             # 共用元件（header、footer、卡片、側欄…）
│   │   ├── layout.js                # 全站 RootLayout
│   │   └── page.js                  # 首頁
│   ├── hooks/
│   │   ├── use-auth.js              # 一般會員登入狀態（localStorage key: reactLoginToken）
│   │   ├── use-admin-auth.js        # 【後台】管理者登入狀態（sessionStorage key: adminToken，見下方）
│   │   ├── use-product.js
│   │   ├── use-article.js
│   │   ├── use-categories.js
│   │   └── use-ship-711-store/
│   ├── utils/
│   │   ├── api.js                   # 統一管理後端網址（NEXT_PUBLIC_API_URL，見下方環境變數）
│   │   └── swal.js
│   ├── styles/                      # 各頁面 CSS（admin.css 是後台管理專用樣式）
│   ├── public/images/
│   │   ├── products/uploads/{商品id}/   # 商品圖片（主圖＋介紹圖混放，檔名 intro_ 開頭的是介紹圖）
│   │   ├── articles/                     # 文章封面圖（全部平放同一層）
│   │   ├── users/user-photo/             # 會員大頭貼
│   │   ├── brands/                       # 品牌 Logo（已內建）
│   │   └── index/                        # 首頁分類/活動圖
│   ├── next.config.mjs
│   ├── jsconfig.json                # 路徑別名 @/* → client/*
│   └── package.json
│
├── server/                          # 後端（Express）
│   ├── routes/
│   │   ├── admin-auth.js            # 【後台】管理者登入 + checkAdminToken 中介層
│   │   ├── admin/                   # 【後台】需要 admin token 才能呼叫的 CRUD API
│   │   │   ├── products.js          #   商品 CRUD（含主圖/介紹圖上傳與刪除）
│   │   │   ├── orders.js            #   訂單列表、狀態更新
│   │   │   ├── users.js             #   會員列表、啟用/停權
│   │   │   └── coupons.js           #   優惠券 CRUD
│   │   ├── articles.js              # 文章（讀取公開；新增/編輯/刪除已加上 checkAdminToken）
│   │   ├── products.js              # 商品（前台公開讀取用）
│   │   ├── users.js                 # 一般會員（註冊/登入/收藏/忘記密碼…）
│   │   ├── cart.js
│   │   ├── coupon.js                # 會員端優惠券查詢/領取（需一般會員 token）
│   │   ├── orders.js                # 會員端訂單
│   │   ├── shipments.js             # 超商物流
│   │   ├── ecpay-callback.js
│   │   └── ecpay-test-only.js
│   ├── models/users.js
│   ├── utils/sendEmail.js
│   ├── connect.js                   # MySQL 連線設定（支援環境變數覆蓋，見下方）
│   ├── index.js                     # Express 進入點、路由掛載、CORS 白名單
│   ├── thync.env                    # 環境變數（機密資訊，不會被 commit）
│   └── package.json
│
├── db/                               # 資料庫 SQL 檔案（依領域分資料夾）
│   ├── user/
│   │   ├── users.sql                 # gender、city、users 三張表 + 89 筆測試會員
│   │   ├── article_favorites.sql     # 文章收藏（多對多）
│   │   └── wishlish.sql              # 商品追蹤清單（多對多；檔名少一個 t，表名叫 wishlist）
│   ├── product/
│   │   ├── category_main.sql         # 商品大分類
│   │   ├── category_sub.sql          # 商品子分類
│   │   ├── brands.sql                # 品牌
│   │   ├── attr.sql                  # 商品屬性（attributes）與屬性值（attribute_option）
│   │   ├── products.sql              # 商品主表 + 1314 筆測試商品
│   │   ├── products_attribute_values.sql  # 商品↔屬性值 對應（多對多）
│   │   ├── products_imgs.sql         # 商品主圖（輪播用）
│   │   ├── products_intro_imgs.sql   # 商品介紹圖（詳情頁說明段落用）
│   │   └── products_with_images_view.sql  # 【VIEW】一次查商品+主圖id+介紹圖id，不占儲存空間
│   ├── articles/
│   │   └── articles.sql              # articles、article_images、article_tags、categories、tags
│   ├── order/
│   │   └── order.sql                 # orders、order_items（無測試資料，只有建表）
│   ├── coupon/
│   │   ├── coupon.sql                # 優惠券主表（建表）
│   │   ├── user_coupons.sql          # 會員持有的優惠券（建表）
│   │   └── insert.sql                # 優惠券測試資料（79 筆）
│   └── admin/
│       └── admins.sql                # 【後台】管理者帳號表 + 1 筆預設帳密（見下方）
│
└── readme.md                         # 本說明檔
```

---

## 開始使用（給第一次接觸的人）

### 第一步：安裝必要工具

1. **Node.js 18 以上**：https://nodejs.org/ （建議 LTS 版）安裝後 `node -v` 確認
2. **Git**：https://git-scm.com/downloads 安裝後 `git --version` 確認
3. **MySQL / MariaDB**：建議用 **XAMPP**（最簡單）：https://www.apachefriends.org/zh_tw/download.html
4. **資料庫管理工具（可選）**：XAMPP 內建 phpMyAdmin（`http://localhost/phpmyadmin`），或用 MySQL Workbench

### 第二步：下載專案（Clone）

```bash
git clone https://github.com/你的GitHub帳號/Thync.git
cd Thync
```

---

### 第三步：建立資料庫並匯入 SQL（重要：順序不可錯）

這是最容易出錯的一步。因為表格之間有外鍵（FOREIGN KEY）關聯，**先建立的表才能被後面的表參考**，順序錯了會匯入失敗。

#### 3-1　先建立資料庫

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS restful CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
```
> XAMPP 預設帳號是 `root`，密碼空白（直接按 Enter）。

#### 3-2　依序匯入（照這個順序，一個都不能跳）

⚠️ **務必加上 `--default-character-set=utf8mb4`**，否則中文資料匯入後會變亂碼（這是本專案實際踩過的坑：帳密只要少了這個參數，Windows 環境下 mysql 客戶端會用系統預設的 big5 去解讀 UTF-8 檔案，中文字全部壞掉）。

```bash
# ① 會員基礎資料（gender、city、users 三張表都在同一個檔案裡）
mysql --default-character-set=utf8mb4 -u root -p restful < db/user/users.sql

# ② 商品分類與品牌（順序：主分類 → 子分類 → 品牌）
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/category_main.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/category_sub.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/brands.sql

# ③ 商品屬性（attributes 依賴 category_main，所以要排在②之後）
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/attr.sql

# ④ 商品主表（依賴 category_main、category_sub、brands）
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/products.sql

# ⑤ 商品屬性對應表、商品圖片（都依賴 products 已存在）
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/products_attribute_values.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/products_imgs.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/products_intro_imgs.sql

# ⑥（可選，但推薦）方便查詢用的檢視表：一次看到商品+主圖id+介紹圖id
mysql --default-character-set=utf8mb4 -u root -p restful < db/product/products_with_images_view.sql

# ⑦ 文章（articles、article_images、article_tags、categories、tags 都在同一檔案）
mysql --default-character-set=utf8mb4 -u root -p restful < db/articles/articles.sql

# ⑧ 訂單（orders、order_items，依賴 users、products）
mysql --default-character-set=utf8mb4 -u root -p restful < db/order/order.sql

# ⑨ 收藏 / 追蹤清單（依賴 users、articles、products）
mysql --default-character-set=utf8mb4 -u root -p restful < db/user/article_favorites.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/user/wishlish.sql

# ⑩ 優惠券（coupon.sql 建表 → user_coupons.sql 建表 → insert.sql 塞測試資料）
mysql --default-character-set=utf8mb4 -u root -p restful < db/coupon/coupon.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/coupon/user_coupons.sql
mysql --default-character-set=utf8mb4 -u root -p restful < db/coupon/insert.sql

# ⑪ 後台管理者帳號（獨立的表，不依賴其他表，隨時匯入都可以，但建議放最後）
mysql --default-character-set=utf8mb4 -u root -p restful < db/admin/admins.sql
```

**依賴關係總結成一張圖：**
```
gender ─┐
city ───┼─→ users ─┬─→ orders ─→ order_items ─→ products
        │          ├─→ article_favorites → articles
        │          ├─→ wishlist → products
        │          └─→ user_coupons → coupon

category_main ─┬─→ category_sub
               ├─→ attributes ─→ attribute_option
               └─→ products ←── brands

products ─┬─→ products_imgs ─┐
          ├─→ products_intro_imgs ─┼─→ products_with_images_view（VIEW，最後才建）
          └─→ products_attribute_values ←── attributes / attribute_option

admins（獨立，不依賴任何表）
```

#### 3-3　如果匯入中途出錯怎麼辦？

- **`DROP TABLE` 相關的錯誤（Unknown table）**：大部分 SQL 檔案開頭都有 `DROP TABLE IF EXISTS`／`DROP TABLE`，第一次匯入、表還不存在時會報這種錯，**是正常現象，可以忽略**，不影響後面的建表跟塞資料。
- **`products_attribute_values` 外鍵建立失敗**：這個檔案裡有 2 筆髒測試資料指向不存在的屬性值（`option_id=166`），會導致最後補外鍵約束那步失敗。處理方式：
  ```sql
  DELETE FROM products_attribute_values WHERE option_id NOT IN (SELECT id FROM attribute_option);
  ALTER TABLE products_attribute_values
    ADD CONSTRAINT products_attribute_values_ibfk_1 FOREIGN KEY (product_id) REFERENCES products(id),
    ADD CONSTRAINT products_attribute_values_ibfk_2 FOREIGN KEY (attribute_id) REFERENCES attributes(id),
    ADD CONSTRAINT products_attribute_values_ibfk_3 FOREIGN KEY (option_id) REFERENCES attribute_option(id);
  ```
- **中文變亂碼**：確認每一次 `mysql` 指令都有加 `--default-character-set=utf8mb4`。如果已經匯入變成亂碼了，必須把該表 `DROP` 掉、用正確參數重新匯入一次（單純 UPDATE 救不回來，因為原始的位元組資料已經在匯入當下被錯誤轉碼，是不可逆的）。

#### 3-4　用 phpMyAdmin 匯入（圖形介面，適合不熟指令的人）

1. 啟動 XAMPP 的 MySQL
2. 瀏覽器打開 `http://localhost/phpmyadmin`
3. 左側「新增資料庫」→ 名稱輸入 `restful`，編碼選 `utf8mb4_general_ci`
4. 點進 `restful` 資料庫 →「匯入」，**依照上面 ①～⑪ 同樣的順序**逐一選檔案匯入
5. 每個檔案匯入後，左側資料表清單如果沒有立刻更新，點一下資料庫名稱本身（不是某張表）強制刷新，或按 F5 重新整理整頁

---

### 第四步：安裝前後端套件

```bash
# 前端
cd client
npm install

# 後端（開新終端機視窗）
cd server
npm install
```

---

### 第五步：設定環境變數

#### 5-1　後端資料庫連線

`server/connect.js` 已經改成**優先讀環境變數，沒有設定才 fallback 回本機預設值**：

```js
host: process.env.DB_HOST || "localhost",
port: Number(process.env.DB_PORT) || 3306,
user: process.env.DB_USER || "admin",
password: process.env.DB_PASSWORD || "a12345",
database: process.env.DB_NAME || "restful",
```

**本機開發完全不用改任何東西**，除非你的 MySQL 帳密跟上面預設值不一樣（例如 XAMPP 預設是 `root` + 空密碼），才需要透過環境變數覆蓋，或直接改這個檔案。

#### 5-2　後端其他環境變數（`server/thync.env`）

```env
JWT_SECRET_KEY=你的JWT密鑰（會員與後台管理者共用同一把密鑰，但 payload 內容不同，互相認不出對方的 token）
SMTP_EMAIL=你的Gmail@gmail.com
SMTP_PASSWORD=你的Gmail應用程式密碼
FROM_NAME=Thync
FROM_EMAIL=你的Gmail@gmail.com
GOOGLE_CLIENT_ID=你的Google登入Client ID

# 部署到正式環境才需要填：
PORT=3007                          # 大部分雲端平台會自動注入，本機不用管
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
FRONTEND_URL=https://你的前端網址   # 多個網址用逗號分隔，CORS 白名單用
```
⚠️ **`thync.env` 已列在 `.gitignore`，裡面是機密資訊，絕對不要 commit。**

#### 5-3　前端環境變數（`client/.env.local`）

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的Google登入Client ID

# 部署到正式環境才需要填，本機開發預設會打 http://localhost:3007，不用設定：
NEXT_PUBLIC_API_URL=https://你的後端網址
```

---

### 第六步：啟動專案

**終端機 1 — 啟動後端：**
```bash
cd server
npm run dev
```
看到 `主機啟動 http://localhost:3007` 代表成功。

**終端機 2 — 啟動前端：**
```bash
cd client
npm run dev
```
看到 `http://localhost:3000` 代表成功。

> 正式環境部署時後端改用 `npm start`（純 `node index.js`，沒有 nodemon 自動重啟）。

---

### 第七步：打開網站

瀏覽器輸入 **http://localhost:3000**，應該能看到首頁、商品、文章都正常顯示。

---

## 後台管理系統

網址：**http://localhost:3000/admin/login**

**預設帳號**：`admin`，密碼**刻意不寫在這份文件裡**（README 通常會跟著專案一起公開，寫在這裡等於把密碼公開給所有看得到 repo 的人）。密碼已用 bcrypt 雜湊存在資料庫，實際明碼請跟專案負責人索取，或自行用下面指令重設：

```bash
node -e "import('bcrypt').then(b=>b.default.hash('你的新密碼',10).then(console.log))"
```
產生出雜湊值後，執行：
```sql
UPDATE admins SET password = '產生出來的雜湊值' WHERE account = 'admin';
```

**運作方式**：後台管理者是**獨立於一般會員的認證系統**——`db/admin/admins.sql` 是完全獨立的表，登入會拿到一組帶 `role: "admin"` 的 JWT token，跟一般會員的 token 互不相通。所有後台寫入 API（`/api/admin/*`，以及文章的新增/編輯/刪除）都會用 [server/routes/admin-auth.js](server/routes/admin-auth.js) 的 `checkAdminToken` 中介層驗證，沒有帶合法的管理者 token 一律回傳 401。

**登入狀態存放**：管理者 token 刻意存在瀏覽器的 **`sessionStorage`**（鍵名 `adminToken`），不是一般常見的 `localStorage`。兩者差異：
- `sessionStorage` 只要**關掉分頁或整個瀏覽器就會自動清空**，下次打開網站要重新登入
- 一般會員的登入（`reactLoginToken`）用的是 `localStorage`，關閉瀏覽器不會登出，可以長期保持登入

這是刻意的設計差異：後台管理者權限較高，要求每次重新打開網站都要重新驗證身份，比一般會員的長期登入更嚴謹。另外要注意：`sessionStorage` 不會跨分頁共用，用滑鼠中鍵在新分頁開後台連結會要求重新登入，這是正常現象。

除了關閉分頁會登出之外，token 本身也有 **8 小時**的有效期限（[server/routes/admin-auth.js](server/routes/admin-auth.js) 簽發時設定），兩個機制同時生效，取比較嚴格的那個。

**功能模組**：

| 模組 | 路徑 | 功能 |
|---|---|---|
| 商品管理 | `/admin/products` | 新增/編輯/上下架，主圖與介紹圖分開管理，圖片存在 `client/public/images/products/uploads/{商品id}/` |
| 訂單管理 | `/admin/orders` | 查看列表、依狀態篩選、更新訂單狀態 |
| 會員管理 | `/admin/users` | 查看列表、啟用/停權（軟性開關，不會刪除會員資料） |
| 優惠券管理 | `/admin/coupons` | 新增/編輯（彈窗表單）/刪除（軟刪除） |
| 文章管理 | `/admin/articles` | 新增/編輯/移至垃圾桶/垃圾桶還原或永久刪除 |

**商品圖片規則**：
- 上傳時用商品 `id` 建立對應資料夾（`uploads/{id}/`），主圖跟介紹圖混放在同一個資料夾，介紹圖檔名固定加 `intro_` 前綴做區分
- 刪除圖片時，會同時刪除硬碟檔案跟資料庫記錄；如果該商品資料夾因此變空，會自動把空資料夾也清掉
- 之後不管資料夾有沒有被刪過，重新上傳一律會自動檢查、重建資料夾，行為固定一致

---

## 資料表關聯總覽

```
gender ─┐
city ───┼─→ users ─┬─→ orders ─→ order_items ─→ products
        │          ├─→ article_favorites → articles
        │          ├─→ wishlist → products
        │          └─→ user_coupons → coupon

category_main ─┬─→ category_sub
               ├─→ attributes ─→ attribute_option
               └─→ products ←── brands

products ─┬─→ products_imgs（主圖，一對多）
          ├─→ products_intro_imgs（介紹圖，一對多）
          └─→ products_attribute_values ←── attributes / attribute_option（多對多）

articles ─┬─→ article_images
          ├─→ article_tags ←── tags（多對多）
          └─→ categories（文章分類，跟商品的 category_main 是不同表）

admins（獨立表，跟 users 沒有任何關聯，管理者帳號與會員帳號完全分離）
```

想快速查「某個商品有哪些主圖/介紹圖」，可以直接查 `products_with_images_view` 這個檢視表（不占儲存空間，永遠是最新資料）：
```sql
SELECT id, name, image_count, image_ids, intro_image_count, intro_image_ids
FROM products_with_images
WHERE id = 1;
```

---

## 圖片與檔案上傳規則

| 類型 | 存放路徑 | 命名規則 | 相關程式碼 |
|---|---|---|---|
| 商品圖片（主圖+介紹圖） | `client/public/images/products/uploads/{商品id}/` | 主圖：`{時間戳}-{序號}.ext`；介紹圖：`intro_{時間戳}-{序號}.ext` | `server/routes/admin/products.js` |
| 文章封面圖 | `client/public/images/articles/` | `cover_{時間戳}_{亂數}.ext`（全部平放同一層，不分文章 id） | `server/routes/articles.js` |
| 會員大頭貼 | `client/public/images/users/user-photo/` | `{時間戳}-{原檔名}` | `server/routes/users.js` |

> 因為圖片檔案數量多、容量大，`client/public/images/products/uploads/`、`client/public/images/users/user-photo/`、`client/public/images/articles/` 這幾個資料夾內容已被 `.gitignore` 排除，**不會被 commit 進 Git**。換到新環境時這些資料夾會是空的，商品/文章會顯示預設的「沒有圖片」樣式，這是正常現象，不影響網站運作。

### 刪除時的清理規則（軟刪除 vs 硬刪除）

三種「刪除」動作行為不一樣，容易混淆：

| 動作 | 資料庫 | 圖片檔案 | 說明 |
|---|---|---|---|
| 商品下架（`/admin/products` 上下架按鈕） | 只切換 `is_valid`，資料保留 | **不動** | 軟性開關，隨時可以重新上架 |
| 商品刪除單張圖片（編輯商品表單裡的 ✕） | 該筆 `products_imgs`/`products_intro_imgs` 記錄真的刪除 | **真的刪除**，資料夾清空的話連資料夾也一併刪掉 | 這個是硬刪除，不可逆 |
| 會員停權（`/admin/users` 停權按鈕） | 只切換 `is_valid`，資料保留 | **不動** | 軟性開關，跟商品下架同邏輯 |
| 會員自己刪除帳號（前台「編輯資料」→「刪除帳號」） | 軟刪除（`is_valid = 0`），`img` 欄位清空 | **視情況刪除**：先確認沒有其他會員共用同一張大頭貼檔案（種子測試資料的頭像是從共用圖庫隨機分配，可能撞名），沒有人共用才真的刪除實體檔案 | 程式碼在 [server/routes/users.js](server/routes/users.js) 的 `DELETE /:account` |

⚠️ **已知安全缺口**：會員自己刪除帳號這支 API（`DELETE /api/users/:account`）目前**沒有做登入驗證**，任何人只要知道帳號名稱字串，就能直接呼叫這支 API 把該帳號軟刪除掉，不需要先登入成那個帳號。上線前建議補上 token 驗證，確認「要刪除的帳號」跟「目前登入的帳號」是同一個人。

---

## 常見問題 / 疑難排解

### Q：`npm install` 出現錯誤？
- 確認 Node.js 版本 18 以上（`node -v`）
- 試試 `npm install --legacy-peer-deps`
- Windows 用戶可能需要以系統管理員身分執行終端機

### Q：資料庫連線失敗？
1. 確認 MySQL/MariaDB 服務有啟動（XAMPP 面板 MySQL 那一列要是綠色）
2. 確認 `server/connect.js` 或環境變數裡的帳密跟你本機 MySQL 一致
3. 確認資料庫名稱是 `restful`
4. 確認 port 是 3306

### Q：後端 API 突然全部回傳 500，訊息含糊？
八成是 MySQL 服務中途被關掉了（`ECONNREFUSED`）。後端會把底層資料庫錯誤統一包裝成籠統的 500 訊息回傳，不會直接暴露內部細節給前端，所以看到「不知名的 500」時第一件事永遠是先檢查資料庫還有沒有在跑。

### Q：中文變亂碼？
匯入 SQL 時沒加 `--default-character-set=utf8mb4`。已經匯入壞掉的資料無法用 UPDATE 救回，必須整張表重新匯入一次。

### Q：新增商品後前台看不到？
確認：
1. 商品有沒有設「上架」（`is_valid = 1`）
2. 商品所屬的主分類/子分類/品牌是否存在——如果選了一個已經被刪除的分類/品牌會導致 JOIN 查不到（商品資料表跟品牌是 LEFT JOIN，沒選品牌也一定會顯示，但分類是必填且用 INNER JOIN，選錯或選到不存在的分類 id 會讓商品整個消失）
3. 商品列表預設沒有排序，新商品的 id 最大，會排在最後一頁，不是第一頁

### Q：後台某個功能點了沒反應、Console 出現 401？
管理者登入的 token 有效期是 8 小時，過期後所有後台 API 都會回 401，回 `/admin/login` 重新登入即可。

### Q：前後端都啟動了但畫面空白？
按 F12 開發者工具看 Console。常見是後端沒啟動在 3007，或是 CORS 白名單沒有加到目前的前端網址（本機開發預設已包含 `localhost:3000`，正式環境要在後端環境變數 `FRONTEND_URL` 補上部署後的網址）。

---

*Happy Coding! 🚀*
