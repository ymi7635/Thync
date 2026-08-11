"use client";
// 購物完成頁（無指定訂單編號版本）

import { useEffect, useState } from "react";
import CartHeader from "@/app/_components/cart/cartHeader";
import CartSteps from "@/app/_components/cart/cartSteps";
import RecommendList from "@/app/_components/cart/recommendList";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import "./success.css";
import "@/app/_components/cart/cartShared.css";

// 推薦商品假資料（與 cartPage.js 統一格式）
const recommend = Array(6).fill({
  img: "https://picsum.photos/id/1058/600/400",
  title: "A4tech 雙飛燕 Bloody S98",
  price: "$2390",
});

export default function Page() {
  // 結帳成功頁進入時清空購物車
  useEffect(() => {
    localStorage.removeItem("cartItems");
  }, []);

  return (
    <>
      <Header />
      <main>
        <div className="cart-header-steps">
          <div className="cartIcon">
            <button
              className="back-mobile"
              onClick={() => window.history.back()}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <i className="fas fa-shopping-cart"></i> 購物車
          </div>
          <CartSteps active={0} />
          <button
            className="backtomain"
            onClick={() => window.history.back()}
          >
            <i
              className="fa-solid fa-turn-down"
              style={{ transform: "rotate(90deg)" }}
            ></i>
            回上頁
          </button>
        </div>
        <div className="container">

          {/* 成功訊息 */}
          <div className="section1">
            <div className="successMessage">
              <div className="thanks">感謝您的訂購！</div>
              <div className="orderNumber">訂單編號：</div>
              <button
                className="product"
                type="button"
                onClick={() => (window.location.href = "/products")}
              >
                繼續購物
              </button>
              <button
                className="order"
                type="button"
                onClick={() => (window.location.href = "/user/orders")}
              >
                查看訂單狀態
              </button>
            </div>
          </div>

          {/* 推薦商品區塊（與 cartPage.js 統一） */}
          <RecommendList recommend={recommend} />
        </div>
      </main>
      <Footer />

    </>
  );
}
