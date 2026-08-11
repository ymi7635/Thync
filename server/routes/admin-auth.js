// 【後台】管理者登入 API 與 checkAdminToken 驗證中介層
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connection from "../connect.js";

const secretKey = process.env.JWT_SECRET_KEY;
const router = express.Router();

// 中介層：驗證後台管理者 token（跟一般會員的 checkToken 分開，payload 帶 role: "admin"）
function checkAdminToken(req, res, next) {
  let token = req.get("Authorization");
  if (token && token.includes("Bearer ")) {
    token = token.slice(7);
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          status: "error",
          message: "管理者登入驗證失效，請重新登入",
        });
      }
      if (decoded.role !== "admin") {
        return res.status(403).json({
          status: "error",
          message: "沒有管理者權限",
        });
      }
      req.admin = decoded;
      next();
    });
  } else {
    res.status(401).json({
      status: "error",
      message: "無管理者登入驗證資料，請重新登入",
    });
  }
}

// 管理者登入
router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;

    if (!account || !password) {
      return res.status(400).json({
        status: "error",
        message: "請輸入帳號與密碼",
      });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM admins WHERE account = ? AND is_valid = 1",
      [account]
    );
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({
        status: "error",
        message: "帳號或密碼錯誤",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "帳號或密碼錯誤",
      });
    }

    const token = jwt.sign(
      { id: admin.id, account: admin.account, role: "admin" },
      secretKey,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      status: "success",
      message: "登入成功",
      data: {
        token,
        admin: { id: admin.id, account: admin.account, name: admin.name },
      },
    });
  } catch (error) {
    console.error("管理者登入錯誤:", error);
    res.status(500).json({
      status: "error",
      message: "登入失敗，請洽系統管理員",
    });
  }
});

// 驗證目前 token 是否仍有效（給前端進頁面時檢查用）
router.get("/status", checkAdminToken, async (req, res) => {
  try {
    const [rows] = await connection.execute(
      "SELECT id, account, name FROM admins WHERE id = ? AND is_valid = 1",
      [req.admin.id]
    );
    const admin = rows[0];
    if (!admin) {
      return res.status(401).json({ status: "error", message: "管理者帳號不存在或已停用" });
    }
    res.status(200).json({ status: "success", data: { admin } });
  } catch (error) {
    console.error("驗證管理者狀態錯誤:", error);
    res.status(500).json({ status: "error", message: "驗證失敗" });
  }
});

export { checkAdminToken };
export default router;
