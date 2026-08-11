"use client";
// 會員已使用優惠券列表區塊（打 /api/coupon/isUsed）

import { useState, useEffect } from "react";
import CouponCard from "./CouponCard";
import "./CouponArea.css";
import { API_URL } from "@/utils/api";

export default function CouponAreaUsed() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch(`${API_URL}/api/coupon/isUsed`, {
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
    <div className="coupon-area used">
      {/* <div className="title">我的優惠券</div> */}
      <div className="coupon-grid">
        {coupons.map((coupon) => (
          <div key={coupon.id} style={{ position: "relative" }} >
            <div className="coupon-stamp-used">已使用</div>
            <CouponCard
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
                status = "used"
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
