"use client";
// 全站共用的頁尾

import { useState, useEffect } from "react";

export default function Footer() {
  const [showMobileFooter, setShowMobileFooter] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 只在瀏覽器端執行
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <footer>
      <div className={`row${isMobile ? (showMobileFooter ? "" : " mobile-hide") : ""}`}>
        <div className="col">
          <h5>商品</h5>
          <a href="http://localhost:3000/products?mid=1">鍵盤｜鍵帽｜鍵盤周邊</a>
          <a href="http://localhost:3000/products?mid=2">滑鼠｜鼠墊｜滑鼠周邊</a>
          <a href="http://localhost:3000/products?mid=3">耳機｜喇叭｜音訊設備</a>
          <a href="http://localhost:3000/products?mid=4">機殼｜電源｜散熱設備</a>
          <a href="http://localhost:3000/products?mid=5">螢幕｜視訊｜相關設備</a>
        </div>
        <div className="col">
          <h5>關於Thync</h5>
          <a href="#">關於我們</a>
          <a href="#">活動消息</a>
          <a href="#">隱私政策</a>
          <a href="#">保固範圍</a>
          <a href="#">聯絡我們</a>
        </div> <div className="col">
          <h5>社群資訊</h5>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">Line</a> </div>
      </div>
      <div
        className="copyright"
        onClick={() => {
          if (isMobile) setShowMobileFooter((v) => !v);
        }}
        style={isMobile ? {
          cursor: "pointer",
          borderTop: showMobileFooter ? "1px solid var(--White)" : "none",
          marginTop: showMobileFooter ? "20px" : "0",
          paddingTop: showMobileFooter ? "20px" : "0"
        } : {}}
      >
        <p>© 2025 Thync. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
