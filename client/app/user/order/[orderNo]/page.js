"use client";
// 會員中心單一訂單詳情頁

import "@/styles/order.css";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb";
import Sidebar from "@/app/_components/user/sidebar";
import Footer from "@/app/_components/footer";
import { API_URL } from "@/utils/api";

export default function UserOrderPage() {
  const { user, setUser } = useAuth();

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 單一訂單資料狀態
  const [order, setOrder] = useState(null);
  const params = useParams();
  const orderNo = params?.orderNo;
  useEffect(() => {
    if (!user || !orderNo) return;
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("reactLoginToken");
        const res = await fetch(`${API_URL}/api/orders/${orderNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.status === "success" && result.data) {
          setOrder(result.data);
        } else {
          setOrder(null);
        }
      } catch (err) {
        setOrder(null);
        console.error("單一訂單資料獲取失敗", err);
      }
    };
    fetchOrder();
  }, [user, orderNo]);

  // 日期格式化工具
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes()) +
      ":" +
      pad(d.getSeconds())
    );
  };

  if (!user) {
    return (
      <div>
        <Header />
      </div>
    );
  }
  if (!order) {
    return (
      <div>
        <Header />
        <div className="container mt-4 mb-4">


          <div className="main-content">
            <h2>訂單明細</h2>
            <div>載入中...</div>

          </div>
        </div>
        <Footer />
      </div>
    );
  }
  // 僅顯示必要欄位
  return (
    <div className="order-detail-page">
      <Header />
      <div className="d-flex container h-700 mt-4 mb-4">
        <Sidebar />



        <div className="container mt-4 mb-4">
          <div className="breadcrumb">
            <Breadcrumb />
          </div>

          <div className="status-info">
            <div className="d-flex flex-row">
              <p><strong>訂單狀態│</strong><span className="danger500"> {order.status_now === "paid"
                            ? "已付款"
                            : order.status_now === "pending"
                            ? "未付款"
                            : order.status_now === "failed"
                            ? "訂單失敗"
                            : order.status_now}</span></p>
              <p className="ms-auto"><strong>訂單編號│</strong> {order.numerical_order}</p>
            </div>
            <div className="d-flex flex-row">
              <p><strong>訂購日期│</strong>
                {formatDate(order.order_date)}
              </p>
            </div>
          </div>
          <div className="order-info mt-4">
            <div className="list">
              <table>
                <thead>
                  <tr>
                    <th>商品明細</th>
                    <th>單價</th>
                    <th>數量</th>
                    <th>小計</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product_name || item.product_id}</td>
                      <td>${Math.floor(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>${Math.floor(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td></td>
                    <td></td>
                    <td>商品小計</td>
                    <td>${Math.floor(order.total)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>運費</td>
                    <td>$60</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>折扣</td>
                    <td>-${(() => {
                      if (!order.discount_info) return 0;
                      if (typeof order.discount_info === 'number') return order.discount_info;
                      if (typeof order.discount_info === 'string') {
                        try {
                          const obj = JSON.parse(order.discount_info);
                          return obj.discount || 0;
                        } catch {
                          return order.discount_info;
                        }
                      }
                      if (typeof order.discount_info === 'object' && order.discount_info !== null) {
                        return order.discount_info.discount || 0;
                      }
                      return 0;
                    })()}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>訂單金額</td>
                    <td className="price">${Math.floor(order.final_amount || order.total)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>運送方式</td>
                    <td>{order.delivery_method}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* 收件資訊區塊 */}
          <div className="delivery-info mt-4">
            <div className="header">
              <h6 className="w-100 text-center">收件資訊</h6>
            </div>
            <div className="info d-flex flex-column gap-3">
              <div>
                <strong>收件姓名│</strong> {order.recipient || "-"}
              </div>
              <div>
                <strong>收件手機│</strong> {order.recipient_phone || "-"}
              </div>
              <div>
                <strong>收件門市│</strong> {order.delivery_store || "-"}
              </div>
              <div>
                <strong>收件地址│</strong> {order.delivery_address || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
