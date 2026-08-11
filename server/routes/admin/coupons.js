// 【後台】優惠券 CRUD API（需管理者 token）
import express from "express";
import connection from "../../connect.js";
import { checkAdminToken } from "../admin-auth.js";

const router = express.Router();

// 優惠券列表
router.get("/", checkAdminToken, async (req, res) => {
  try {
    const { search, page = 1, per_page = 20 } = req.query;
    let sql = "SELECT * FROM coupon WHERE 1=1";
    const params = [];
    if (search) {
      sql += " AND (code LIKE ? OR `desc` LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    // LIMIT/OFFSET 不用 ? 綁定，避免 mysql2 在部分 MySQL/MariaDB 版本上噴
    // "Incorrect arguments to mysqld_stmt_execute"，已用 parseInt 轉成安全整數再拼字串
    const limitNum = Math.max(1, parseInt(per_page, 10) || 20);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    sql += ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`;

    let countSql = "SELECT COUNT(*) AS total FROM coupon WHERE 1=1";
    const countParams = [];
    if (search) {
      countSql += " AND (code LIKE ? OR `desc` LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
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
    console.error("後台優惠券列表錯誤:", error);
    res.status(500).json({ status: "error", message: "優惠券列表讀取失敗" });
  }
});

// 新增優惠券
router.post("/", checkAdminToken, async (req, res) => {
  try {
    const { code, desc, type, value, min, start_at, expires_at } = req.body;
    if (!code || !desc || type === undefined || value === undefined || !start_at || !expires_at) {
      return res.status(400).json({ status: "error", message: "請填寫完整優惠券資訊" });
    }
    const [result] = await connection.execute(
      `INSERT INTO coupon (code, \`desc\`, type, value, min, start_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, desc, type, value, min || 0, start_at, expires_at]
    );
    res.status(201).json({ status: "success", message: "優惠券新增成功", data: { id: result.insertId } });
  } catch (error) {
    console.error("新增優惠券錯誤:", error);
    res.status(500).json({ status: "error", message: "優惠券新增失敗" });
  }
});

// 編輯優惠券
router.put("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, desc, type, value, min, start_at, expires_at, is_active } = req.body;

    const [existing] = await connection.execute("SELECT id FROM coupon WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ status: "error", message: "找不到優惠券" });
    }

    await connection.execute(
      `UPDATE coupon SET
        code = ?, \`desc\` = ?, type = ?, value = ?, min = ?,
        start_at = ?, expires_at = ?, is_active = ?
       WHERE id = ?`,
      [
        code,
        desc,
        type,
        value,
        min || 0,
        start_at,
        expires_at,
        is_active === undefined ? 1 : Number(is_active),
        id,
      ]
    );
    res.json({ status: "success", message: "優惠券更新成功" });
  } catch (error) {
    console.error("更新優惠券錯誤:", error);
    res.status(500).json({ status: "error", message: "優惠券更新失敗" });
  }
});

// 刪除（軟刪除，is_valid = 0）
router.delete("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute(
      "UPDATE coupon SET is_valid = 0 WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "找不到優惠券" });
    }
    res.json({ status: "success", message: "優惠券已刪除" });
  } catch (error) {
    console.error("刪除優惠券錯誤:", error);
    res.status(500).json({ status: "error", message: "刪除失敗" });
  }
});

export default router;
