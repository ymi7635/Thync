// 超商物流（7-11）選店結果轉導 API
import express from "express";
const router = express.Router();



// 接收 7-11 選店 POST，再 redirect 回前端
router.post("/711", (req, res) => {
  const callbackUrl = "http://localhost:3000/ship/callback";
  res.redirect(callbackUrl + "?" + new URLSearchParams(req.body).toString());
});

export default router;
