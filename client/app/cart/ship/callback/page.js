"use client";
// 7-11 選店完成後的回呼頁面（開窗選店用）

import { Suspense } from "react";
import { useShip711StoreCallback } from "@/hooks/use-ship-711-store";

function CallbackContent() {
  useShip711StoreCallback();
  return <p>處理中，請稍候…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p>處理中，請稍候…</p>}>
      <CallbackContent />
    </Suspense>
  );
}
