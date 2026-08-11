// 【後台】會員列表查詢與啟用/停權 API（需管理者 token）
import express from "express";
import connection from "../../connect.js";
import { checkAdminToken } from "../admin-auth.js";

const router = express.Router();

// 會員列表
router.get("/", checkAdminToken, async (req, res) => {
  try {
    const { search, page = 1, per_page = 20 } = req.query;
    let sql = `
      SELECT id, name, mail, account, phone, is_valid, create_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (name LIKE ? OR mail LIKE ? OR account LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(Number(per_page), (Number(page) - 1) * Number(per_page));

    let countSql = "SELECT COUNT(*) AS total FROM users WHERE 1=1";
    const countParams = [];
    if (search) {
      countSql += " AND (name LIKE ? OR mail LIKE ? OR account LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
    console.error("後台會員列表錯誤:", error);
    res.status(500).json({ status: "error", message: "會員列表讀取失敗" });
  }
});

// 啟用／停權
router.patch("/:id/toggle-valid", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute(
      "SELECT is_valid FROM users WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "找不到會員" });
    }
    const newValid = rows[0].is_valid ? 0 : 1;
    await connection.execute("UPDATE users SET is_valid = ? WHERE id = ?", [
      newValid,
      id,
    ]);
    res.json({
      status: "success",
      message: newValid ? "已啟用會員" : "已停權會員",
      is_valid: newValid,
    });
  } catch (error) {
    console.error("切換會員狀態錯誤:", error);
    res.status(500).json({ status: "error", message: "操作失敗" });
  }
});

export default router;
