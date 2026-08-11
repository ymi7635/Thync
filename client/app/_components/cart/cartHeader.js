"use client";
// 購物車系列頁面（購物車/結帳/確認/完成）共用的頁首標題列
import "./cartShared.css";

export default function CartHeader({ title = "購物車" }) {
  return (
    <>
      <div className="cart-header-steps">
        <div className="cartIcon">
          <button className="back-mobile" onClick={() => window.history.back()}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <i className="fas fa-shopping-cart"></i> 購物車
        </div>
        <button className="backtomain" onClick={() => window.history.back()}>
          <i
            className="fa-solid fa-turn-down"
            style={{ transform: "rotate(90deg)" }}
          ></i>
          回上頁
        </button>
      </div>
    </>
  );
}
