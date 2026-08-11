// 會員端訂單建立與查詢 API

import express from "express";
import connection from "../connect.js";
import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET_KEY;

const router = express.Router();
// JWT 驗證中介層（精簡版）
function checkToken(req, res, next) {
  let token = req.get("Authorization");
  if (token && token.includes("Bearer ")) {
    token = token.slice(7);
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          status: "error",
          message: "登入驗證失效，請重新登入",
        });
      }
      req.decoded = decoded;
      req.userId = decoded.id;
      next();
    });
  } else {
    res.status(401).json({
      status: "error",
      message: "無登入驗證資料，請重新登入",
    });
  }
}

router.post("/", checkToken, async (req, res) => {
  try {
    const {
      delivery_method,
      delivery_store, 
      delivery_address, 
      recipient,
      recipient_phone,
      pay_method,
      subtotal,
      discount,
      finalAmount,
      items,
    } = req.body;

    // 建立訂單編號
    const numerical_order = `od${Date.now()}`;

    // 建立訂單
    const [result] = await connection.execute(
      `INSERT INTO orders
       (numerical_order, user_id, delivery_method, delivery_store, delivery_address, recipient, recipient_phone,
        pay_method, status_now, total, discount_info, final_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numerical_order,
        req.userId,
        delivery_method || null,
        delivery_store || null,
        delivery_address || null,
        recipient || null,
        recipient_phone || null,
        pay_method || "ecpay",
        "pending",
        subtotal,
        discount ? JSON.stringify({ discount }) : null,
        finalAmount,
      ]
    );

    const orderId = result.insertId;

    // 建立 order_items
    for (const item of items || []) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.qty, item.price]
      );
    }

    res.json({ status: "success", orderId, numerical_order });
  } catch (err) {
    console.error("建立訂單失敗:", err);
    res.status(500).json({ status: "error", message: "建立訂單失敗" });
  }
});

// 取得用戶所有訂單（含 order_items）
router.get("/", checkToken, async (req, res) => {
  try {
    // 查詢該用戶的所有訂單
    const [orders] = await connection.execute(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC`,
      [req.userId]
    );
    // 查詢所有訂單的 order_items
    const orderIds = orders.map((o) => o.id);
    let orderItems = [];
    if (orderIds.length > 0) {
      const [items] = await connection.execute(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
      orderItems = items;
    }
    // 將 order_items 按訂單分組
    const itemsByOrder = {};
    for (const item of orderItems) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }
    // 合併資料
    const result = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));
    res.json({ status: "success", data: result });
  } catch (err) {
    console.error("取得訂單失敗:", err);
    res.status(500).json({ status: "error", message: "取得訂單失敗" });
  }
});

// 取得單一訂單（含 order_items）
router.get("/:orderNo", checkToken, async (req, res) => {
  try {
    const { orderNo } = req.params;
    // 查詢該用戶的單一訂單
    const [orders] = await connection.execute(
      `SELECT * FROM orders WHERE user_id = ? AND numerical_order = ? LIMIT 1`,
      [req.userId, orderNo]
    );
    if (!orders.length) return res.status(404).json({ status: "error", message: "找不到訂單" });
    const order = orders[0];
    // 查詢該訂單的 order_items 並 join products 取得商品名稱（假設 products.name 為商品名稱欄位）
    const [items] = await connection.execute(
      `SELECT oi.*, p.name as product_name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
    res.json({ status: "success", data: order });
  } catch (err) {
    console.error("取得單一訂單失敗:", err);
    res.status(500).json({ status: "error", message: "取得單一訂單失敗" });
  }
});








export default router;
