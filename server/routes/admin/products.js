// 【後台】商品 CRUD API，含主圖/介紹圖上傳與刪除、資料夾自動清理（需管理者 token）
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connection from "../../connect.js";
import { checkAdminToken } from "../admin-auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 圖片先存記憶體，等拿到 product id 之後才寫進對應的 {id}/ 資料夾
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("只允許上傳圖片文件"));
  },
});

const router = express.Router();

function getUploadDir(productId) {
  return path.join(
    __dirname,
    `../../../client/public/images/products/uploads/${productId}`
  );
}

// prefix 用來區分主圖跟介紹圖的檔名，避免同一批上傳撞名（intro_ 開頭 = 介紹圖）
function saveImageFile(productId, file, index, prefix = "") {
  const uploadDir = getUploadDir(productId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const ext = path.extname(file.originalname) || ".jpg";
  const filename = `${prefix}${Date.now()}-${index}${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return `${productId}/${filename}`;
}

// 資料夾空了就順手清掉，維持跟主圖刪除時一樣的行為
function removeUploadDirIfEmpty(productId) {
  const uploadDir = getUploadDir(productId);
  if (fs.existsSync(uploadDir) && fs.readdirSync(uploadDir).length === 0) {
    fs.rmdirSync(uploadDir);
  }
}

// 商品新增/編輯表單同時有「主圖(images)」跟「介紹圖(introImages)」兩組檔案欄位
const uploadProductImages = upload.fields([
  { name: "images", maxCount: 8 },
  { name: "introImages", maxCount: 12 },
]);

// 全部商品（後台用，含下架商品）
router.get("/", checkAdminToken, async (req, res) => {
  try {
    const { search, page = 1, per_page = 20 } = req.query;
    let sql = `
      SELECT
        p.*,
        category_main.name AS category_main_name,
        category_sub.name AS category_sub_name,
        brands.name AS brand_name,
        (SELECT file FROM products_imgs WHERE product_id = p.id LIMIT 1) AS first_image
      FROM products p
      JOIN category_main ON p.category_main_id = category_main.id
      JOIN category_sub ON p.category_sub_id = category_sub.id
      LEFT JOIN brands ON p.brand_id = brands.id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND p.name LIKE ?";
      params.push(`%${search}%`);
    }
    // LIMIT/OFFSET 不用 ? 綁定，避免 mysql2 在部分 MySQL/MariaDB 版本上噴
    // "Incorrect arguments to mysqld_stmt_execute"，已用 parseInt 轉成安全整數再拼字串
    const limitNum = Math.max(1, parseInt(per_page, 10) || 20);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    sql += ` ORDER BY p.id DESC LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`;

    let countSql = "SELECT COUNT(*) AS total FROM products p WHERE 1=1";
    const countParams = [];
    if (search) {
      countSql += " AND p.name LIKE ?";
      countParams.push(`%${search}%`);
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
    console.error("後台商品列表錯誤:", error);
    res.status(500).json({ status: "error", message: "商品列表讀取失敗" });
  }
});

// 單一商品（後台用，含完整圖片清單）
router.get("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "找不到商品" });
    }
    const [images] = await connection.execute(
      "SELECT id, file FROM products_imgs WHERE product_id = ?",
      [id]
    );
    const [introImages] = await connection.execute(
      "SELECT id, file FROM products_intro_imgs WHERE product_id = ?",
      [id]
    );
    res.json({ status: "success", data: { ...rows[0], images, introImages } });
  } catch (error) {
    console.error("後台商品讀取錯誤:", error);
    res.status(500).json({ status: "error", message: "商品讀取失敗" });
  }
});

// 新增商品
router.post("/", checkAdminToken, uploadProductImages, async (req, res) => {
  try {
    const {
      category_main_id,
      category_sub_id,
      brand_id,
      name,
      modal,
      price,
      intro,
      spec,
    } = req.body;

    if (!category_main_id || !category_sub_id || !name || !price) {
      return res.status(400).json({
        status: "error",
        message: "請填寫必填欄位（主分類、子分類、名稱、價格）",
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO products
          (category_main_id, category_sub_id, brand_id, name, modal, price, intro, spec, is_valid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        category_main_id,
        category_sub_id,
        brand_id || null,
        name,
        modal || "-",
        price,
        intro || null,
        spec || null,
      ]
    );
    const productId = result.insertId;

    const mainFiles = req.files?.images || [];
    for (let i = 0; i < mainFiles.length; i++) {
      const filePath = saveImageFile(productId, mainFiles[i], i);
      await connection.execute(
        "INSERT INTO products_imgs (file, product_id) VALUES (?, ?)",
        [filePath, productId]
      );
    }

    const introFiles = req.files?.introImages || [];
    for (let i = 0; i < introFiles.length; i++) {
      const filePath = saveImageFile(productId, introFiles[i], i, "intro_");
      await connection.execute(
        "INSERT INTO products_intro_imgs (file, product_id) VALUES (?, ?)",
        [filePath, productId]
      );
    }

    res.status(201).json({
      status: "success",
      message: "商品新增成功",
      data: { id: productId },
    });
  } catch (error) {
    console.error("新增商品錯誤:", error);
    res.status(500).json({ status: "error", message: "商品新增失敗" });
  }
});

// 編輯商品
router.put("/:id", checkAdminToken, uploadProductImages, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_main_id,
      category_sub_id,
      brand_id,
      name,
      modal,
      price,
      intro,
      spec,
      is_valid,
    } = req.body;

    const [existing] = await connection.execute(
      "SELECT id FROM products WHERE id = ?",
      [id]
    );
    if (!existing.length) {
      return res.status(404).json({ status: "error", message: "找不到商品" });
    }

    await connection.execute(
      `UPDATE products SET
          category_main_id = ?, category_sub_id = ?, brand_id = ?, name = ?,
          modal = ?, price = ?, intro = ?, spec = ?, is_valid = ?
         WHERE id = ?`,
      [
        category_main_id,
        category_sub_id,
        brand_id || null,
        name,
        modal || "-",
        price,
        intro || null,
        spec || null,
        is_valid === undefined ? 1 : Number(is_valid),
        id,
      ]
    );

    const mainFiles = req.files?.images || [];
    for (let i = 0; i < mainFiles.length; i++) {
      const filePath = saveImageFile(id, mainFiles[i], i);
      await connection.execute(
        "INSERT INTO products_imgs (file, product_id) VALUES (?, ?)",
        [filePath, id]
      );
    }

    const introFiles = req.files?.introImages || [];
    for (let i = 0; i < introFiles.length; i++) {
      const filePath = saveImageFile(id, introFiles[i], i, "intro_");
      await connection.execute(
        "INSERT INTO products_intro_imgs (file, product_id) VALUES (?, ?)",
        [filePath, id]
      );
    }

    res.json({ status: "success", message: "商品更新成功" });
  } catch (error) {
    console.error("更新商品錯誤:", error);
    res.status(500).json({ status: "error", message: "商品更新失敗" });
  }
});

// 刪除單張商品圖
router.delete("/:id/images/:imageId", checkAdminToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const [rows] = await connection.execute(
      "SELECT file FROM products_imgs WHERE id = ? AND product_id = ?",
      [imageId, id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "找不到圖片" });
    }
    const filePath = path.join(
      __dirname,
      `../../../client/public/images/products/uploads/${rows[0].file}`
    );
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
    await connection.execute("DELETE FROM products_imgs WHERE id = ?", [imageId]);
    removeUploadDirIfEmpty(id);

    res.json({ status: "success", message: "圖片已刪除" });
  } catch (error) {
    console.error("刪除商品圖片錯誤:", error);
    res.status(500).json({ status: "error", message: "刪除失敗" });
  }
});

// 刪除單張商品介紹圖
router.delete("/:id/intro-images/:imageId", checkAdminToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const [rows] = await connection.execute(
      "SELECT file FROM products_intro_imgs WHERE id = ? AND product_id = ?",
      [imageId, id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "找不到圖片" });
    }
    const filePath = path.join(
      __dirname,
      `../../../client/public/images/products/uploads/${rows[0].file}`
    );
    fs.existsSync(filePath) && fs.unlinkSync(filePath);
    await connection.execute("DELETE FROM products_intro_imgs WHERE id = ?", [imageId]);
    removeUploadDirIfEmpty(id);

    res.json({ status: "success", message: "介紹圖已刪除" });
  } catch (error) {
    console.error("刪除商品介紹圖錯誤:", error);
    res.status(500).json({ status: "error", message: "刪除失敗" });
  }
});

// 上下架（軟刪除／恢復）
router.patch("/:id/toggle-valid", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute(
      "SELECT is_valid FROM products WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "找不到商品" });
    }
    const newValid = rows[0].is_valid ? 0 : 1;
    await connection.execute("UPDATE products SET is_valid = ? WHERE id = ?", [
      newValid,
      id,
    ]);
    res.json({ status: "success", message: newValid ? "已上架" : "已下架", is_valid: newValid });
  } catch (error) {
    console.error("切換商品上下架錯誤:", error);
    res.status(500).json({ status: "error", message: "操作失敗" });
  }
});

export default router;
