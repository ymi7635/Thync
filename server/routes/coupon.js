// 會員端優惠券查詢與領取 API（需一般會員 token）
import express from "express";
import connection from "../connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // ← 新增
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// JWT 驗證中介層
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies?.token; // 支援 cookie 或 Bearer

  if (!token) {
    return res.status(401).json({ error: "缺少授權 token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT 驗證失敗:", err);
    return res.status(403).json({ error: "無效或過期的 token" });
  }
}

/* 查詢當前登入者的優惠券（不需要 userId） */
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT 
  c.id,
  c.code,
  c.desc,
  c.type,
  c.value,
  c.min,
  c.start_at,
  c.expires_at
FROM coupon c
LEFT JOIN user_coupons uc 
  ON uc.coupon_id = c.id AND uc.user_id = ?
WHERE c.is_active = 1 
  AND c.is_valid = 1
  AND c.expires_at > NOW()
  AND uc.id IS NULL`,
      [userId]
    );

    console.log("JWT payload:", req.user);
    console.log("查詢 userId:", userId);
    console.log("查詢結果 rows:", rows);

    res.json(rows);
  } catch (err) {
    console.error("查詢優惠券失敗:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 查詢當前登入者的優惠券（不需要 userId） */
router.get("/available", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT uc.id, c.id AS coupon_id, c.code, c.\`desc\`, c.type, c.value, c.min,
              uc.is_used, uc.used_at, c.expires_at
       FROM user_coupons uc
       JOIN coupon c ON uc.coupon_id = c.id
       WHERE uc.user_id = ?
         AND uc.is_used = 0
         AND c.expires_at > NOW()`,
      [userId]
    );

    console.log("JWT payload:", req.user);
    console.log("查詢 userId:", userId);
    console.log("查詢結果 rows:", rows);

    res.json(rows);
  } catch (err) {
    console.error("查詢優惠券失敗:", err);
    res.status(500).json({ error: err.message });
  }
});


/* 查詢當前登入者的已使用優惠券（不需要 userId） */
router.get("/isUsed", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT uc.id, c.id AS coupon_id, c.code, c.\`desc\`, c.type, c.value, c.min,
              uc.is_used, uc.used_at, c.expires_at
       FROM user_coupons uc
       JOIN coupon c ON uc.coupon_id = c.id
       WHERE uc.user_id = ?
         AND uc.is_used = 1
         AND c.expires_at > NOW()`,
      [userId]
    );

    console.log("JWT payload:", req.user);
    console.log("查詢 userId:", userId);
    console.log("查詢結果 rows:", rows);

    res.json(rows);
  } catch (err) {
    console.error("查詢優惠券失敗:", err);
    res.status(500).json({ error: err.message });
  }
});

/* 查詢當前登入者的已過期優惠券（不需要 userId） */
router.get("/expired", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT uc.id, c.id AS coupon_id, c.code, c.\`desc\`, c.type, c.value, c.min,
              uc.is_used, uc.used_at, c.expires_at
       FROM user_coupons uc
       JOIN coupon c ON uc.coupon_id = c.id
       WHERE uc.user_id = ?
         AND uc.is_used = 0
         AND c.expires_at < NOW()`,
      [userId]
    );

    console.log("JWT payload:", req.user);
    console.log("查詢 userId:", userId);
    console.log("查詢結果 rows:", rows);

    res.json(rows);
  } catch (err) {
    console.error("查詢優惠券失敗:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/receive", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupon_id } = req.body;

    if (!coupon_id) {
      return res.status(400).json({ error: "缺少 coupon_id" });
    }

    // 檢查優惠券是否存在且未過期
    const [couponRows] = await connection.query(
      `SELECT * FROM coupon WHERE id = ? AND is_active = 1 AND is_valid = 1 AND expires_at > NOW()`,
      [coupon_id]
    );
    if (couponRows.length === 0) {
      return res.status(404).json({ error: "優惠券不存在、無效或已過期" });
    }

    // 檢查用戶是否已領取該優惠券
    const [userCouponRows] = await connection.query(
      `SELECT * FROM user_coupons WHERE user_id = ? AND coupon_id = ?`,
      [userId, coupon_id]
    );
    if (userCouponRows.length > 0) {
      return res.status(400).json({ error: "您已領取該優惠券" });
    }

    // 領取優惠券
    await connection.query(
      `INSERT INTO user_coupons (user_id, coupon_id) VALUES (?, ?)`,
      [userId, coupon_id]
    );

    res.status(201).json({ message: "領取成功" });
  } catch (err) {
    console.error("領取優惠券失敗:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
