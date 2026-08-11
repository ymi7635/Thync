// 購物車 API（以會員 JWT 的 mail 作為購物車 key）
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  let token = req.get("Authorization");
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded; // decoded.mail 可當作購物車 key
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token 無效" });
    }
  } else {
    return res.status(401).json({ message: "缺少 Token" });
  }
}
const router = express.Router();

// 模擬購物車資料：以 userId 當 key
const carts = {};


function toPid(id) {
  return Number(id); // product_id 一律轉數字
}

function toNumber(value, defaultValue = 0) {
  const n = Number(value);
  return isNaN(n) ? defaultValue : n;
}

// 取得購物車
router.get("/", authMiddleware, (req, res) => {
  const uid = req.user.mail;
  const cart = carts[uid] || [];
  res.json(cart);
});

// 加商品
router.post("/", authMiddleware, (req, res) => {
  const { product_id, name, image, quantity, price } = req.body;
  const uid = req.user.mail;
  const pid = toPid(product_id);
  const qty = toNumber(quantity, 1);
  const prc = toNumber(price);

  if (!carts[uid]) {
    carts[uid] = [];
  }

  const existingItem = carts[uid].find((item) => item.product_id === pid);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    carts[uid].push({
      product_id: pid,
      name,
      image,
      quantity: qty,
      price: prc,
    });
  }

  res.json({ message: "已加入購物車", cart: carts[uid] });
});

// 清空購物車
router.delete("/", authMiddleware, (req, res) => {
  const uid = req.user.mail;
  carts[uid] = [];
  res.json({ message: "購物車已清空" });
});

// 結帳
router.get("/checkout", authMiddleware, (req, res) => {
  const uid = req.user.mail;
  const cart = carts[uid] || [];
  if (cart.length === 0)
    return res.status(400).json({ message: "購物車是空的" });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.json({
    user_id: uid,
    total,
    final_amount: total,
    coupons_id: null,
    discount_info: null,
    cart_items: cart,
  });
});

export default router;
