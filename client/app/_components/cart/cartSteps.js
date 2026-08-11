"use client";
// 購物車結帳流程的步驟進度條（訂單明細→填寫資料→確認→完成）

import "./cartShared.css";

export default function CartSteps({ active = 0 }) {
  const steps = ["訂單明細", "填寫收件資料", "確認訂單", "購物完成"];
  return (
    <div className="cart-steps">
      {steps.map((label, i) => (
        <div key={i} className={`cart-step ${i === active ? "active" : ""} ${i < active ? "done" : ""}`}>
          <div className="cart-step-circle">
            {i < active ? (
              <span className="cart-step-check">✔</span>
            ) : null}
          </div>
          <div className="cart-step-label">{label}</div>
        </div>
      ))}
    </div>
  );
}