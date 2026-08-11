// MySQL 連線設定（mysql2 連線池），支援環境變數覆蓋本機預設值
import mysql from "mysql2/promise";
// 正式環境請改用環境變數（DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME）覆蓋，
// 沒有設定環境變數時，會 fallback 回本機開發用的預設值。
const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "a12345",
  database: process.env.DB_NAME || "restful",
  charset: "utf8mb4",
});

export default connection;
