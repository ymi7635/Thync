// 文章 API：前台公開讀取 + 後台新增/編輯/刪除（寫入動作需管理者 token）
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import connection from "../connect.js";
import { fileURLToPath } from "url";
import { checkAdminToken } from "./admin-auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文章圖片上傳設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(
      __dirname,
      "../../client/public/images/articles/"
    );
    
    // 確保目錄存在
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：cover_時間戳_隨機數.副檔名
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const uniqueName = `cover_${timestamp}_${randomNum}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
  fileFilter: function (req, file, cb) {
    // 只允許圖片文件
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只允許上傳圖片文件"));
    }
  },
});
const router = express.Router();


// route(s) 路由規則(們)
// routers (路由物件器)
// 獲取所有文章
router.get("/", async (req, res) => {
  try {
    const { cid, tag_id, search, sort, order, page = 1, per_page = 6 } = req.query;
    let sql = `
    SELECT DISTINCT
      a.*,
      c.name AS category_name,
      GROUP_CONCAT(DISTINCT t.name ORDER BY t.name ASC SEPARATOR ', ') AS tags,
      GROUP_CONCAT(DISTINCT t.id ORDER BY t.name ASC SEPARATOR ',') AS tag_ids
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE 1=1
    `;
    let params = [];
    
    // 只篩選未刪除的文章（如果 is_deleted 欄位存在）
    sql += " AND (a.is_deleted = 0 OR a.is_deleted IS NULL)";

    // 支援多個分類ID（用逗號分隔）
    if (cid) {
      const categoryIds = cid.split(',').map(id => id.trim()).filter(id => id);
      if (categoryIds.length > 0) {
        sql += ` AND a.category_id IN (${categoryIds.map(() => '?').join(',')})`;
        params.push(...categoryIds);
      }
    }
    
    // 支援多個標籤ID（用逗號分隔）
    if (tag_id) {
      const tagIds = tag_id.split(',').map(id => id.trim()).filter(id => id);
      if (tagIds.length > 0) {
        sql += ` AND EXISTS (
          SELECT 1 FROM article_tags at2 
          WHERE at2.article_id = a.id 
          AND at2.tag_id IN (${tagIds.map(() => '?').join(',')})
        )`;
        params.push(...tagIds);
      }
    }
    if (search) {
      sql += " AND (a.title LIKE ? OR a.content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // GROUP BY
    sql += " GROUP BY a.id, c.id, c.name";

    // 排序（只允許特定欄位，避免 SQL injection）
    if (sort && ["created_at", "updated_at", "views", "title"].includes(sort)) {
      sql += ` ORDER BY a.${sort} ${order === "desc" ? "DESC" : "ASC"}`;
    } else {
      sql += " ORDER BY a.created_at DESC";
    }

    // 分頁
    // LIMIT/OFFSET 不用 ? 綁定，避免 mysql2 在部分 MySQL/MariaDB 版本上噴
    // "Incorrect arguments to mysqld_stmt_execute"，已用 parseInt 轉成安全整數再拼字串
    {
      const limitNum = Math.max(1, parseInt(per_page, 10) || 6);
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      sql += ` LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`;
    }

    let [articles] = await connection.execute(sql, params);

    // 獲取總筆數（用於分頁）
    let countSql = `
    SELECT COUNT(DISTINCT a.id) as total
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE 1=1
    `;
    let countParams = [];
    
    // 同樣的篩選條件
    countSql += " AND (a.is_deleted = 0 OR a.is_deleted IS NULL)";
    
    // 支援多個分類ID（用逗號分隔）
    if (cid) {
      const categoryIds = cid.split(',').map(id => id.trim()).filter(id => id);
      if (categoryIds.length > 0) {
        countSql += ` AND a.category_id IN (${categoryIds.map(() => '?').join(',')})`;
        countParams.push(...categoryIds);
      }
    }
    
    // 支援多個標籤ID（用逗號分隔）
    if (tag_id) {
      const tagIds = tag_id.split(',').map(id => id.trim()).filter(id => id);
      if (tagIds.length > 0) {
        countSql += ` AND EXISTS (
          SELECT 1 FROM article_tags at2 
          WHERE at2.article_id = a.id 
          AND at2.tag_id IN (${tagIds.map(() => '?').join(',')})
        )`;
        countParams.push(...tagIds);
      }
    }
    if (search) {
      countSql += " AND (a.title LIKE ? OR a.content LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    let [countResult] = await connection.execute(countSql, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(per_page));

    res.status(200).json({
      status: "success",
      data: {
        articles,
        pagination: {
          current_page: Number(page),
          per_page: Number(per_page),
          total: total,
          total_pages: totalPages,
          has_prev: Number(page) > 1,
          has_next: Number(page) < totalPages
        }
      },
      message: "已獲取所有文章"
    });
  } catch (error) {
    // 補獲錯誤
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "文章頁讀取錯誤，請洽管理人員"
    });
  }
});

// 除錯用 API - 查看資料庫中的所有文章（不含篩選）
router.get("/debug", async (req, res) => {
  try {
    // 查看文章總數
    const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM articles");
    
    // 查看前 5 筆文章資料
    const [articles] = await connection.execute("SELECT id, title, category_id, is_deleted FROM articles LIMIT 5");
    
    // 查看分類資料
    const [categories] = await connection.execute("SELECT * FROM categories LIMIT 5");
    
    // 查看標籤資料
    const [tags] = await connection.execute("SELECT * FROM tags LIMIT 5");
    
    // 查看文章標籤關聯
    const [articleTags] = await connection.execute("SELECT * FROM article_tags LIMIT 5");

    res.json({
      status: "success",
      debug_info: {
        total_articles: countResult[0].total,
        sample_articles: articles,
        sample_categories: categories,
        sample_tags: tags,
        sample_article_tags: articleTags
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: "Debug error",
      error: err.message 
    });
  }
});

// 文章選項的 API
router.get("/categories", async (req, res) => {
  try {
    // 同時查分類、標籤
    const [categories] = await connection.execute("SELECT id, name FROM categories WHERE 1");
    const [tags] = await connection.execute("SELECT id, name FROM tags WHERE 1");

    res.json({
      status: "success",
      categories,
      tags
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "DB error" });
  }
});
// 獲取垃圾桶文章 (必須放在 /:id 路由之前)
router.get("/trash", async (req, res) => {
  try {
    const { search, page = 1, per_page = 10 } = req.query;
    
    let sql = `
      SELECT DISTINCT
        a.*,
        c.name AS category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.is_deleted = 1
    `;
    let params = [];
    
    if (search) {
      sql += " AND (a.title LIKE ? OR a.content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += " ORDER BY a.updated_at DESC";
    // LIMIT/OFFSET 不用 ? 綁定，避免 mysql2 在部分 MySQL/MariaDB 版本上噴
    // "Incorrect arguments to mysqld_stmt_execute"，已用 parseInt 轉成安全整數再拼字串
    {
      const limitNum = Math.max(1, parseInt(per_page, 10) || 6);
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      sql += ` LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`;
    }

    let [articles] = await connection.execute(sql, params);

    // 獲取總筆數
    let countSql = `
      SELECT COUNT(*) as total
      FROM articles a
      WHERE a.is_deleted = 1
    `;
    let countParams = [];
    
    if (search) {
      countSql += " AND (a.title LIKE ? OR a.content LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    let [countResult] = await connection.execute(countSql, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(per_page));

    res.status(200).json({
      status: "success",
      data: {
        articles,
        pagination: {
          current_page: Number(page),
          per_page: Number(per_page),
          total: total,
          total_pages: totalPages,
          has_prev: Number(page) > 1,
          has_next: Number(page) < totalPages
        }
      },
      message: "已獲取垃圾桶文章"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "獲取垃圾桶文章失敗"
    });
  }
});

// 獲取文章選項 (分類和標籤) - 必須放在動態路由之前
router.get("/options", async (req, res) => {
  try {
    // 同時查分類、標籤
    const [categories] = await connection.execute("SELECT id, name FROM categories WHERE 1");
    const [tags] = await connection.execute("SELECT id, name FROM tags WHERE 1");

    res.json({
      status: "success",
      categories,
      tags
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "DB error" });
  }
});

// 清空垃圾桶
router.delete("/trash/empty", checkAdminToken, async (req, res) => {
  try {
    // 獲取所有已刪除的文章ID
    const [deletedArticles] = await connection.execute(
      "SELECT id FROM articles WHERE is_deleted = 1"
    );
    
    if (deletedArticles.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "垃圾桶已經是空的"
      });
    }
    
    const articleIds = deletedArticles.map(article => article.id);
    const placeholders = articleIds.map(() => '?').join(',');
    
    // 刪除文章標籤關聯
    await connection.execute(
      `DELETE FROM article_tags WHERE article_id IN (${placeholders})`,
      articleIds
    );
    
    // 刪除文章圖片關聯
    await connection.execute(
      `DELETE FROM article_images WHERE article_id IN (${placeholders})`,
      articleIds
    );
    
    // 永久刪除文章
    const [result] = await connection.execute(
      `DELETE FROM articles WHERE id IN (${placeholders})`,
      articleIds
    );

    res.status(200).json({
      status: "success",
      message: `已永久刪除 ${result.affectedRows} 篇文章`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "清空垃圾桶失敗"
    });
  }
});

// 獲取特定 ID 的文章
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let sql = `
    SELECT 
      a.*,
      c.name AS category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ? AND a.is_deleted = 0
    `;
    let [articles] = await connection.execute(sql, [id]);
    
    if (articles.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在"
      });
    }

    // 更新瀏覽次數
    await connection.execute("UPDATE articles SET views = views + 1 WHERE id = ?", [id]);

    // 獲取文章標籤
    let tagsResult = await connection.execute(`
      SELECT t.id, t.name
      FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `, [id]);
    
    // 獲取文章圖片
    let imagesResult = await connection.execute(`
      SELECT id, image_url, description
      FROM article_images
      WHERE article_id = ?
    `, [id]);

    const article = {
      ...articles[0],
      tags: tagsResult[0],
      images: imagesResult[0]
    };

    res.status(200).json({
      status: "success",
      data: article,
      message: `已獲取文章：${article.title}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "獲取文章時發生錯誤，請洽管理人員"
    });
  }
});

// 獲取隨機推薦文章 (排除當前文章)
router.get("/:id/related", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;
    
    // 獲取當前文章的分類
    const [currentArticle] = await connection.execute(
      "SELECT category_id FROM articles WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [id]
    );
    
    if (currentArticle.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在"
      });
    }
    
    const categoryId = currentArticle[0].category_id;
    
    // 先嘗試獲取相同分類的文章
    let sql = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.cover_image,
        a.created_at,
        a.views,
        c.name AS category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id != ? 
        AND (a.is_deleted = 0 OR a.is_deleted IS NULL)
        AND a.category_id = ?
      ORDER BY RAND()
      LIMIT ?
    `;
    
    let [relatedArticles] = await connection.execute(sql, [id, categoryId, parseInt(limit)]);
    
    // 如果相同分類的文章不足，補充其他文章
    if (relatedArticles.length < parseInt(limit)) {
      const remaining = parseInt(limit) - relatedArticles.length;
      const excludeIds = [id, ...relatedArticles.map(article => article.id)];
      
      const placeholders = excludeIds.map(() => '?').join(',');
      const otherSql = `
        SELECT 
          a.id,
          a.title,
          a.content,
          a.cover_image,
          a.created_at,
          a.views,
          c.name AS category_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id NOT IN (${placeholders})
          AND (a.is_deleted = 0 OR a.is_deleted IS NULL)
        ORDER BY RAND()
        LIMIT ?
      `;
      
      const [otherArticles] = await connection.execute(otherSql, [...excludeIds, remaining]);
      relatedArticles = [...relatedArticles, ...otherArticles];
    }

    res.status(200).json({
      status: "success",
      data: relatedArticles,
      message: "已獲取相關文章推薦"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "獲取相關文章時發生錯誤"
    });
  }
});


// 新增文章
router.post("/", checkAdminToken, upload.single('cover_image'), async (req, res) => {
  try {
    const { title, content, category_id, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        status: "error",
        message: "標題和內容為必填欄位"
      });
    }

    // 處理封面圖片
    let coverImage = null;
    if (req.file) {
      // 使用multer處理後的檔案名
      coverImage = req.file.filename;
    }

    // 插入文章
    const insertSql = `
      INSERT INTO articles (title, content, category_id, cover_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await connection.execute(insertSql, [
      title,
      content,
      category_id || null,
      coverImage
    ]);

    const articleId = result.insertId;

    // 處理標籤
    if (tags && tags.trim()) {
      const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      for (const tagName of tagNames) {
        // 檢查標籤是否存在，不存在則建立
        let [existingTag] = await connection.execute(
          "SELECT id FROM tags WHERE name = ?",
          [tagName]
        );
        
        let tagId;
        if (existingTag.length === 0) {
          const [tagResult] = await connection.execute(
            "INSERT INTO tags (name) VALUES (?)",
            [tagName]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = existingTag[0].id;
        }
        
        // 建立文章標籤關聯
        await connection.execute(
          "INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)",
          [articleId, tagId]
        );
      }
    }

    res.status(201).json({
      status: "success",
      data: { id: articleId },
      message: "文章建立成功"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "建立文章時發生錯誤"
    });
  }
});

// 更新文章
router.put("/:id", checkAdminToken, upload.single('cover_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category_id, tags, keep_current_image, current_cover_image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        status: "error",
        message: "標題和內容為必填欄位"
      });
    }

    // 處理封面圖片
    let coverImage = null;
    if (req.file) {
      coverImage = req.file.filename;
      
      // 如果上傳了新圖片且存在舊圖片，刪除舊圖片
      if (current_cover_image) {
        const oldImagePath = path.join(
          __dirname,
          "../../client/public/images/articles/",
          current_cover_image
        );
        
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
            console.log(`已刪除舊圖片: ${current_cover_image}`);
          } catch (error) {
            console.error(`刪除舊圖片失敗: ${error.message}`);
          }
        }
      }
    } else if (keep_current_image === 'true' && current_cover_image) {
      coverImage = current_cover_image;
    }

    // 更新文章
    const updateSql = `
      UPDATE articles 
      SET title = ?, content = ?, category_id = ?, cover_image = ?, updated_at = NOW()
      WHERE id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
    `;
    
    const [result] = await connection.execute(updateSql, [
      title,
      content,
      category_id || null,
      coverImage,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在或已被刪除"
      });
    }

    // 刪除舊的標籤關聯
    await connection.execute("DELETE FROM article_tags WHERE article_id = ?", [id]);

    // 處理新標籤
    if (tags && tags.trim()) {
      const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      for (const tagName of tagNames) {
        // 檢查標籤是否存在，不存在則建立
        let [existingTag] = await connection.execute(
          "SELECT id FROM tags WHERE name = ?",
          [tagName]
        );
        
        let tagId;
        if (existingTag.length === 0) {
          const [tagResult] = await connection.execute(
            "INSERT INTO tags (name) VALUES (?)",
            [tagName]
          );
          tagId = tagResult.insertId;
        } else {
          tagId = existingTag[0].id;
        }
        
        // 建立文章標籤關聯
        await connection.execute(
          "INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)",
          [id, tagId]
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: "文章更新成功"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "更新文章時發生錯誤"
    });
  }
});

// 軟刪除文章
router.patch("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_deleted } = req.body;
    
    const updateSql = `
      UPDATE articles 
      SET is_deleted = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(updateSql, [is_deleted, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在"
      });
    }

    const action = is_deleted === 1 ? "移至垃圾桶" : "恢復";
    res.status(200).json({
      status: "success",
      message: `文章已${action}`
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "操作失敗"
    });
  }
});

// 恢復文章
router.patch("/:id/restore", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateSql = `
      UPDATE articles 
      SET is_deleted = 0, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await connection.execute(updateSql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在"
      });
    }

    res.status(200).json({
      status: "success",
      message: "文章已恢復"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "恢復文章失敗"
    });
  }
});

// 永久刪除文章
router.delete("/:id", checkAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先刪除文章標籤關聯
    await connection.execute("DELETE FROM article_tags WHERE article_id = ?", [id]);
    
    // 刪除文章圖片關聯
    await connection.execute("DELETE FROM article_images WHERE article_id = ?", [id]);
    
    // 刪除文章
    const deleteSql = "DELETE FROM articles WHERE id = ?";
    const [result] = await connection.execute(deleteSql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "文章不存在"
      });
    }

    res.status(200).json({
      status: "success",
      message: "文章已永久刪除"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "永久刪除失敗"
    });
  }
});

export default router;