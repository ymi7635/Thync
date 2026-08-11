// 統一管理後端 API 網址，讀取 NEXT_PUBLIC_API_URL 環境變數，本機開發預設打 localhost:3007
// 統一管理後端 API 網址。
// 本機開發不用設定任何東西，預設會打 http://localhost:3007。
// 部署到 Vercel 等平台時，請在環境變數設定 NEXT_PUBLIC_API_URL=https://你的後端網址
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3007";
