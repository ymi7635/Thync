// 綠界金流付款完成後的伺服器對伺服器回呼處理
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connection from "../connect.js";

const router = express.Router();

// GET 測試 → 瀏覽器會帶 origin，要 cors
router.get("/", cors({ origin: "http://localhost:3000" }), (req, res) => {
  res.json({ status: "ok", message: "GET 測試成功" });
});

// POST 綠界回呼 → 不需要 cors，直接收
router.post("/", bodyParser.urlencoded({ extended: false }), async (req, res) => {
  try {
    const {
      MerchantTradeNo,
      TradeNo,
      RtnCode,
      RtnMsg,
      TradeAmt,
      PaymentDate,
      PaymentType,
    } = req.body;

    console.log("綠界回傳:", req.body);

    const status_now = RtnCode === "1" ? "paid" : "failed";
    const pay_info = `TradeNo:${TradeNo} | Msg:${RtnMsg}`;
    const paid_at = RtnCode === "1" ? PaymentDate.replace(/\//g, "-") : null;

    const sql = `
      UPDATE orders
      SET status_now = ?,
          pay_method = ?,
          pay_info = ?,
          final_amount = ?,
          paid_at = ?
      WHERE numerical_order = ?
    `;

    await connection.execute(sql, [
      status_now,
      PaymentType,
      pay_info,
      TradeAmt,
      paid_at,
      MerchantTradeNo,
    ]);

  res.redirect(302, `http://localhost:3000/cart/success/${MerchantTradeNo}`);
  } catch (err) {
    console.error("回呼處理失敗:", err);
    res.status(500).send("0|Error");
  }
});

export default router;
