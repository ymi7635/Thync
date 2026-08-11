// 【後台】訂單列表查詢與狀態更新 API（需管理者 token）
import express from "express";
import connection from "../../connect.js";
import { checkAdminToken } from "../admin-auth.js";

const router = express.Router();

// 訂單列表
router.get("/", checkAdminToken, async (req, res) => {
  try {
    const { search, status, page = 1, per_page = 20 } = req.query;
    let sql = `
      SELECT o.*, u.name AS user_name, u.mail AS user_mail
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (o.numerical_order LIKE ? OR u.name LIKE ? OR u.mail LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      sql += " AND o.status_now = ?";
      params.push(status);
    }
    // LIMIT/OFFSET 不用 ? 綁定，避免 mysql2 在部分 MySQL/MariaDB 版本上噴
    // "Incorrect arguments to mysqld_stmt_execute"，已用 parseInt 轉成安全整數再拼字串
    const limitNum = Math.max(1, parseInt(per_page, 10) || 20);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    sql += ` ORDER BY o.order_date DESC LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`;

    let countSql = `
      SELECT COUNT(*) AS total FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const countParams = [];
    if (search) {
      countSql += " AND (o.numerical_order LIKE ? OR u.name LIKE ? OR u.mail LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      countSql += " AND o.status_now = ?";
      countParams.push(status);
    }

    const [rows] = await connection.execute(sql, params);
    const [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;

    res.json({
      status: "success",
      data: rows,
      pagination: {
        page: Number(page),
        per_page: Number(per_page),
        total,
        total_pages: Math.ceil(total / per_page),
      },
    });
  } catch (error) {
    console.error("後台訂單列表錯誤:", error);
    res.status(500).json({ status: "error", message: "訂單列表讀取失敗" });
  }
});

// 單一訂單明細
router.get("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await connection.execute(
      `SELECT o.*, u.name AS user_name, u.mail AS user_mail
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );
    if (!orders.length) {
      return res.status(404).json({ status: "error", message: "找不到訂單" });
    }
    const [items] = await connection.execute(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );
    res.json({ status: "success", data: { ...orders[0], items } });
  } catch (error) {
    console.error("後台訂單讀取錯誤:", error);
    res.status(500).json({ status: "error", message: "訂單讀取失敗" });
  }
});

// 更新訂單狀態
router.patch("/:id/status", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status_now } = req.body;
    const allowed = ["pending", "paid", "failed"];
    if (!allowed.includes(status_now)) {
      return res.status(400).json({
        status: "error",
        message: `狀態值僅能為 ${allowed.join(" / ")}`,
      });
    }
    const paidAtClause = status_now === "paid" ? ", paid_at = NOW()" : "";
    const [result] = await connection.execute(
      `UPDATE orders SET status_now = ?${paidAtClause} WHERE id = ?`,
      [status_now, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "找不到訂單" });
    }
    res.json({ status: "success", message: "訂單狀態已更新" });
  } catch (error) {
    console.error("更新訂單狀態錯誤:", error);
    res.status(500).json({ status: "error", message: "更新失敗" });
  }
});

export default router;
