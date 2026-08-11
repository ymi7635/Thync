"use client";
// 會員中心「訂單查詢」列表頁

import "@/styles/order.css";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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

  // 訂單資料狀態
  const [orders, setOrders] = useState([]);
  // 取得訂單資料
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("reactLoginToken");
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        console.log("[訂單資料]", result);
        if (Array.isArray(result.data)) {
          setOrders(result.data);
          result.data.forEach((order, idx) => {
            console.log(`[訂單${idx}]`, order);
          });
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
        console.error("訂單資料獲取失敗", err);
      }
    };
    fetchOrders();
  }, [user]);

  // 日期格式化工具
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    function pad(n) {
      return n.toString().padStart(2, "0");
    }
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
  }

  if (user) {
    return (
      <div>
        <Header />
        <div className="d-flex container h-700 mt-4 mb-4">
          <Sidebar />

          <div className="main-content">
            <div className="breadcrumb">
              <Breadcrumb />
            </div>

            {/* 電腦版 */}
            <div className="table-container hidden-mobile">
              {orders.length === 0 ? (
                <button
                  className="btn btn-show"
                  onClick={() => (window.location.href = "/products")}
                >
                  開始購物
                </button>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>訂單編號</th>
                      <th>訂單金額</th>
                      <th>訂購日期</th>
                      <th>付款方式</th>
                      <th>付款日期</th>
                      <th>取貨方式</th>
                      <th>訂單狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={idx}>
                        <td>
                          <a
                            href={`/user/order/${order.numerical_order}`}
                            className="order-link"
                          >
                            {order.numerical_order}
                          </a>
                        </td>
                        <td>
                          <p>${Math.floor(order.total)}</p>
                        </td>
                        <td>
                          <p>{formatDate(order.order_date)}</p>
                        </td>
                        <td>
                          <p>
                            {order.pay_method === "TWQR_OPAY"
                              ? "ECPAY"
                              : order.pay_method}
                          </p>
                        </td>
                        <td>
                          <p>
                            {order.paid_at
                              ? formatDate(order.paid_at)
                              : "無付款資訊"}
                          </p>
                        </td>
                        <td>
                          <p> {order.delivery_method}</p>
                        </td>
                        <td>
                          <p
                            className={
                              order.status_now === "paid"
                                ? "status status-paid"
                                : order.status_now === "pending"
                                ? "status status-unpaid"
                                : order.status_now === "failed"
                                ? "status status-cancelled"
                                : "status"
                            }
                          >
                            {order.status_now === "paid"
                              ? "已付款"
                              : order.status_now === "pending"
                              ? "未付款"
                              : order.status_now === "failed"
                              ? "訂單失敗"
                              : order.status_now}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 手機版 */}
            <div className="orders-container hidden-pc">
              {orders.length === 0 ? (
                <button
                  className="btn btn-show"
                  onClick={() => (window.location.href = "/products")}
                >
                  開始購物
                </button>
              ) : (
                orders.map((order, idx) => (
                  <div key={idx} className="order-card">
                    <div className="order-header">
                      <span className="order-number">
                        訂單編號：
                        <a
                          href={`/user/order/${order.numerical_order}`}
                          className="order-link"
                        >
                          {order.numerical_order}
                        </a>
                      </span>
                      <span
                        className={`order-status ${
                          order.status_now === "paid"
                            ? "status-paid"
                            : order.status_now === "pending"
                            ? "status-unpaid"
                            : order.status_now === "failed"
                            ? "status-cancelled"
                            : ""
                        }`}
                      >
                        {order.status_now === "paid"
                          ? "已付款"
                          : order.status_now === "pending"
                          ? "未付款"
                          : order.status_now === "failed"
                          ? "訂單失敗"
                          : order.status_now}
                      </span>
                    </div>

                    <div className="order-body">
                      <div className="price-section w-100 d-flex justify-content-between align-items-center">
                        <div className="price">
                          NT$ {Math.floor(order.total).toLocaleString()}
                        </div>
                        <a
                          href={`/user/order/${order.numerical_order}`}
                          className="detail-button"
                        >
                          詳情
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
