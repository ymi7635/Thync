"use client";
// 購物車頁面的優惠券橫向選擇區塊，選券後回傳給結帳頁計算折扣

import { useState, useEffect, useRef } from "react";
import CartCouponCard from "./CartCouponCard";
import "./CartCoupon.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "@/utils/api";

export default function CartCouponArea({ userId, total, onApply }) {
  console.log("CartCouponArea rendered", userId, total);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const couponListRef = useRef(null);

  const scrollCoupons = (dir) => {
    const node = couponListRef.current;
    if (!node) return;
    const cardWidth = 375 + 16; // 卡片寬度+gap
    node.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch(`${API_URL}/api/coupon/available`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("reactLoginToken")}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        console.log("API 回傳優惠券", data);

        // 🔹 把後端數字型 type 轉成前端能讀的字串
        const normalized = data.map((c) => ({
          ...c,
          type:
            c.type === 0
              ? "amount"
              : c.type === 1
              ? "percent"
              : c.type === 2
              ? "free_shipping"
              : "unknown",
        }));

        console.log("轉換後的優惠券", normalized);

        setCoupons(normalized); // ✅ 設定到 state
      } catch (err) {
        console.error("載入優惠券失敗", err);
      }
    }
    fetchCoupons(); // 直接呼叫，不要判斷 userId
  }, []);

  function handleSelect(coupon) {
    const isValid = total >= coupon.min;
    if (!isValid) {
      alert(`❌ 此券需滿 ${coupon.min} 元才可使用`);
      return;
    }
    setSelectedCoupon(coupon);

    let discount = 0;
    if (coupon.type === "amount") {
      discount = coupon.value;
    } else if (coupon.type === "percent") {
      discount = Math.floor(total * (coupon.value / 100));
    } else if (coupon.type === "free_shipping") {
      discount = 0; // 免運不在這裡扣，由 CartSummary 處理
    }
    onApply(discount, coupon);
  }

  return (
    <div className="cart-coupon-wrapper">
      <h3 className="coupon-title">可用的優惠券</h3>
      <button className="scroll-btn left" onClick={() => scrollCoupons(-1)}>
        {" "}
        <FontAwesomeIcon icon={faCaretLeft} />
      </button>
      <div className="cart-coupon-area">
        <div className="coupon-scroll-list" ref={couponListRef}>
          {coupons.map((c) => {
            let title = "";
            let subtitle = "";

            if (c.type === "amount") {
              subtitle = ` ${c.code} `;
              title = `滿${c.min}元 折${c.value}元`;
            } else if (c.type === "percent") {
              subtitle = ` ${c.code} `;
              title = `滿${c.min}元 享${100 - c.value}折`;
            } else if (c.type === "free_shipping") {
              subtitle = ` ${c.code} `;
              title = "不限金額免運";
            }

            return (
              <CartCouponCard
                key={c.id}
                description={subtitle}
                name={title}
                amount=""
                expireDate={`到期日：${new Date(
                  c.expires_at
                ).toLocaleDateString()}`}
                isActive={selectedCoupon?.id === c.id}
                isDisabled={total < c.min}
                onClick={() => handleSelect(c)}
              />
            );
          })}
        </div>
      </div>{" "}
      <button className="scroll-btn right" onClick={() => scrollCoupons(1)}>
        <FontAwesomeIcon icon={faCaretRight} />
      </button>
    </div>
  );
}
