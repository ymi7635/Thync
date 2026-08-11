"use client";
// 會員目前持有優惠券列表區塊（打 /api/coupon/list）

import { useState, useEffect } from "react";
import CouponCard from "./CouponCard";
import "./CouponArea.css";
import { API_URL } from "@/utils/api";

export default function CouponAreaList() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const res = await fetch(`${API_URL}/api/coupon/list`, {
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
              // status={
              //   new Date(coupon.expires_at) < new Date()
              //     ? "expired"
              //     : coupon.is_used
              //     ? "used"
              //     : "usable"
              // }
            />
            {(!coupon.is_used && new Date(coupon.expires_at) > new Date()) && (
              <button
                className="btn get-coupon-btn"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/coupon/receive`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("reactLoginToken")}`,
                      },
                      body: JSON.stringify({ coupon_id: coupon.id }),
                      credentials: "include",
                    });
                    const result = await res.json();
                    if (res.ok) {
                      alert("領取成功！");
                      // 領取後重新載入優惠券
                      window.location.reload();
                    } else {
                      alert(result.error || "領取失敗");
                    }
                  } catch (err) {
                    alert("領取失敗");
                  }
                }}
              >領取</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
