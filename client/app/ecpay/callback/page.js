"use client";
// 綠界付款完成後導回的前端頁面，顯示回傳參數

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CallbackContent() {
  const searchParams = useSearchParams();

  // 把 query string 全部抓出來
  const entries = Array.from(searchParams.entries());

  return (
    <div style={{ padding: "20px" }}>
      <h1>付款完成回傳結果</h1>
      {entries.length === 0 ? (
        <p>目前沒有參數</p>
      ) : (
        <ul>
          {entries.map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>載入中...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
