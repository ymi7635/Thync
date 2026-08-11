// Express 進入點：掛載所有路由、設定 CORS 白名單、啟動伺服器
import express from "express";
import multer from "multer";
import cors from "cors";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import couponRouter from "./routes/coupon.js";
import articlesRouter from "./routes/articles.js";
import shipmentRouter from "./routes/shipments.js";
import ecpayTestRouter from "./routes/ecpay-test-only.js";
import ecpayCallbackRouter from "./routes/ecpay-callback.js";
import ordersRouter from "./routes/orders.js";
import adminAuthRouter from "./routes/admin-auth.js";
import adminProductsRouter from "./routes/admin/products.js";
import adminOrdersRouter from "./routes/admin/orders.js";
import adminUsersRouter from "./routes/admin/users.js";
import adminCouponsRouter from "./routes/admin/coupons.js";

// 設定區
// 正式環境請在環境變數 FRONTEND_URL 填入前端網址（例如 Vercel 網域），
// 多個網址可用逗號分隔，例如 "https://thync.vercel.app,https://thync-demo.vercel.app"
let whitelist = [
  "http://localhost:5500",
  "http://localhost:3000",
  "http://localhost:5173", // React/Vite 開發用
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((s) => s.trim()) : []),
];

let corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// 環境設定
const app = express();


app.use("/ecpay-callback", ecpayCallbackRouter);
// 全域中介軟體
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 路由區
app.get("/", (req, res) => {
  res.send("首頁");
});

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/articles", articlesRouter);
app.use("/shipments", shipmentRouter);
app.use("/ecpay-test", ecpayTestRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminAuthRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/admin/coupons", adminCouponsRouter);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`主機啟動 http://localhost:${PORT}`);
});

function checkToken(req, res, next) {
  next();
}
