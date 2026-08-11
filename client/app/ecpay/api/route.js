// 綠界金流付款完成回呼的 API Route
import { NextResponse } from "next/server";

// ✅ GET：方便你用瀏覽器直接測試
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "這是測試用 GET，真正的綠界回呼會走 POST",
  });
}

// ✅ POST：綠界付款完成回呼
export async function POST(req) {
  try {
    const formData = await req.formData();
    const entries = {};
    for (const [key, value] of formData.entries()) {
      entries[key] = value;
    }

    console.log("綠界回傳參數:", entries);

    // 回傳 JSON，方便你測試看到內容
    return NextResponse.json({
      status: "success",
      data: entries,
    });
  } catch (err) {
    console.error("回呼處理失敗:", err);
    return NextResponse.json(
      { status: "error", message: err.message },
      { status: 500 }
    );
  }
}
