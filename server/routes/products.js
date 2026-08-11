// 商品 API：前台公開讀取用（列表/分類/單一商品詳情）
import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import connection from "../connect.js";

const upload = multer();

const router = express.Router();


// route(s) 路由規則(們)
// routers (路由物件器)
// 獲取所有商品
router.get("/", async (req, res) => {
  try {
    const { mid, cid, brand_id, search, sort, order, page = 1, per_page = 16, options } = req.query;

    let sql = `
      SELECT 
        products.*,
        category_main.name AS category_main_name,
        category_sub.name AS category_sub_name,
        brands.name AS brand_name,
        (
          SELECT file 
          FROM products_imgs 
          WHERE product_id = products.id 
          LIMIT 1
        ) AS first_image
      FROM products
      JOIN category_main ON products.category_main_id = category_main.id
      JOIN category_sub ON products.category_sub_id = category_sub.id
      LEFT JOIN brands ON products.brand_id = brands.id
      WHERE products.is_valid = 1
    `;
    let params = [];

    if (mid) {
      sql += " AND products.category_main_id = ?";
      params.push(mid);
    }
    if (cid) {
      sql += " AND products.category_sub_id = ?";
      params.push(cid);
    }
    if (brand_id) {
      const ids = brand_id.split(",");
      sql += ` AND products.brand_id IN (${ids.map(() => "?").join(",")})`;
      params.push(...ids);
    }
    if (search) {
      sql += " AND products.name LIKE ?";
      params.push(`%${search}%`);
    }
    if (options) {
      const optionIds = options.split(",");
      sql += `
        AND products.id IN (
          SELECT product_id
          FROM products_attribute_values
          WHERE option_id IN (${optionIds.map(() => "?").join(",")})
          GROUP BY product_id
          HAVING COUNT(DISTINCT option_id) = ${optionIds.length}
        )
      `;
      params.push(...optionIds);
    }

    const priceMin = req.query.price_min ? Number(req.query.price_min) : 0;
    const priceMax = req.query.price_max ? Number(req.query.price_max) : 9999999;

    sql += " AND products.price BETWEEN ? AND ?";
    params.push(priceMin, priceMax);

    if (sort && ["price"].includes(sort)) {
      sql += ` ORDER BY products.${sort} ${order === "desc" ? "DESC" : "ASC"}`;
    }

    // 分頁
    sql += " LIMIT ? OFFSET ?";
    params.push(Number(per_page));
    params.push((Number(page) - 1) * Number(per_page));

    // 🆕 查總數，和上面一樣的條件
    let countSql = `
      SELECT COUNT(*) AS total
      FROM products
      JOIN category_main ON products.category_main_id = category_main.id
      JOIN category_sub ON products.category_sub_id = category_sub.id
      LEFT JOIN brands ON products.brand_id = brands.id
      WHERE products.is_valid = 1
    `;
    let countParams = [];

    if (mid) {
      countSql += " AND products.category_main_id = ?";
      countParams.push(mid);
    }
    if (cid) {
      countSql += " AND products.category_sub_id = ?";
      countParams.push(cid);
    }
    if (brand_id) {
      const ids = brand_id.split(",");
      countSql += ` AND products.brand_id IN (${ids.map(() => "?").join(",")})`;
      countParams.push(...ids);
    }
    if (search) {
      countSql += " AND products.name LIKE ?";
      countParams.push(`%${search}%`);
    }
    if (options) {
      const optionIds = options.split(",");
      countSql += `
        AND products.id IN (
          SELECT product_id
          FROM products_attribute_values
          WHERE option_id IN (${optionIds.map(() => "?").join(",")})
          GROUP BY product_id
          HAVING COUNT(DISTINCT option_id) = ${optionIds.length}
        )
      `;
      countParams.push(...optionIds);
    }

    countSql += " AND products.price BETWEEN ? AND ?";
    countParams.push(priceMin, priceMax);

    let [countRows] = await connection.execute(countSql, countParams);
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / per_page);

    let [products] = await connection.execute(sql, params);

    res.status(200).json({
      status: "success",
      data: products,
      pagination: {
        page: Number(page),
        per_page: Number(per_page),
        total,
        totalPages
      },
      message: "已獲取所有商品"
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.code ?? 401;
    const statusText = error.status ?? "error";
    const message = error.message ?? "商品頁讀取錯誤，請洽管理人員";
    res.status(statusCode).json({
      status: statusText,
      message
    });
  }
});


// 商品選項的 API
router.get("/categories", async (req, res) => {
  try {
    // 同時查母分類、子分類、品牌
    const [main] = await connection.execute("SELECT id, name FROM category_main WHERE 1");
    const [sub] = await connection.execute("SELECT id, name,main_id FROM category_sub WHERE 1");
    const [brand] = await connection.execute("SELECT id, name FROM brands WHERE 1");

    res.json({
      status: "success",
      main,
      sub,
      brand
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "商品分類取得錯誤" });
  }
});

// 商品屬性的 API
router.get("/attributes", async (req, res) => {
  try {
    // 同時查屬性、值
    const [attributes] = await connection.execute("SELECT id, name, main_id FROM attributes WHERE 1");
    const [options] = await connection.execute("SELECT id, attribute_id,value FROM attribute_option WHERE 1");
    res.json({
      status: "success",
      attributes,
      options
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "商品屬性取得錯誤" });
  }
});

// 獲取特定 ID 的商品 (含圖片/介紹圖)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 產品基本資料
    const sqlProduct = `
      SELECT 
        p.id,
        p.name AS product_name,
        m.id AS main_id, m.name AS main_name,
        s.id AS sub_id, s.name AS sub_name,
        b.id AS brand_id, b.name AS brand_name,
        p.price, p.modal, p.intro, p.spec
      FROM products p
      JOIN category_main m ON p.category_main_id = m.id
      JOIN category_sub s ON p.category_sub_id = s.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_valid = 1
        AND p.id = ?
      LIMIT 1
    `;
    const [rows] = await connection.execute(sqlProduct, [id]);
    if (!rows.length) {
      return res.status(404).json({
        status: "error",
        message: "找不到商品"
      });
    }
    const product = rows[0];

    // 商品主圖（輪播用）
    const [images] = await connection.execute(
      "SELECT id, file FROM products_imgs WHERE product_id = ?",
      [id]
    );

    // 商品介紹圖
    const [introImages] = await connection.execute(
      "SELECT id, file FROM products_intro_imgs WHERE product_id = ?",
      [id]
    );

    res.status(200).json({
      status: "success",
      data: {
        ...product,
        images,
        introImages
      },
      message: "已獲取單一商品"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "商品細節讀取錯誤"
    });
  }
});



export default router;