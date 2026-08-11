"use client";
// 指定訂單編號的購物完成頁

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CartHeader from "@/app/_components/cart/cartHeader";
import CartSteps from "@/app/_components/cart/cartSteps";
import RecommendList from "@/app/_components/cart/recommendList";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import "../success.css";

import "@/app/_components/cart/cartShared.css";

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = params?.orderNo;

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
          <CartSteps active={3} />
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
          <hr className="progressLine" />
          <div className="section1">
            <div className="successMessage">
              <div className="thanks">感謝您的訂購！</div>
              <div className="orderNumber">訂單編號：{orderNo}</div>
              <button
                className="product"
                type="button"
                onClick={() => router.push("/products")}
              >
                繼續購物
              </button>
              <button
                className="order"
                type="button"
                onClick={() => router.push(`/user/order/${orderNo}`)}
              >
                查看訂單狀態
              </button>
            </div>
          </div>
          <RecommendList />
        </div>
      </main>
      <Footer />
    </>
  );
}