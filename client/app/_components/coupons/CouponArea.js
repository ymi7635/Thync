"use client";
// 會員可領取優惠券列表區塊（打 /api/coupon/available）

import { useState, useEffect } from "react";
import CouponCard from "./CouponCard";
import "./CouponArea.css";
import { API_URL } from "@/utils/api";

export default function CouponArea() {
  const [coupons, setCoupons] = useState([]);

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
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("讀取優惠券失敗:", err);
        setCoupons([]); // 發生錯誤時也給空陣列
      }
    }
    fetchCoupons();
  }, []);

  return (
    <div className="coupon-area">
      {/* <div className="title">我的優惠券</div> */}
      <div className="coupon-grid">
        {coupons.map((coupon) => (
        <div key={coupon.id} style={{ position: "relative" }} >
          <CouponCard
            key={coupon.id}
            type={
              coupon.type === 0
                ? "折價券"
                : coupon.type === 1
                ? "折扣券"
                : coupon.type === 2
                ? "免運券"
                : "其他"
            }
            name={coupon.code}
            description={coupon.desc}
            expireDate={`使用期限 ${new Date(
              coupon.expires_at
            ).toLocaleDateString()}`}
            status={
              new Date(coupon.expires_at) < new Date()
                ? "expired"
                : coupon.is_used
                ? "used"
                : "usable"
            }
          />
          </div>
        ))}
      </div>
    </div>
  );
}
