"use client";
// 會員中心「追蹤商品」列表頁

import styles from "@/styles/wishlist.css";
import "@/styles/loader.css";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb";
import Sidebar from "@/app/_components/user/sidebar";
import Footer from "@/app/_components/footer";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { swalError, swalSuccess, swalConfirm } from "@/utils/swal";
import { API_URL } from "@/utils/api";

export default function UserWishListPage() {
  const { user, setUser, isLoading } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchWishlist() {
      if (!user) return;

      const token = localStorage.getItem("reactLoginToken");
      const res = await fetch(`${API_URL}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      console.log(result);
      if (result.status === "success") {
        setWishlist(result.data);
      }
      console.log("token:", token);
      console.log("user:", user);
    }
    fetchWishlist();
  }, [user]);

  if (isLoading) {
    return <div className="loader"></div>;
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
            <div className="product-list">
              {wishlist.length === 0 && (
                <button
                  className="btn btn-show"
                  onClick={() => (window.location.href = "/products")}
                >
                  開始追蹤商品
                </button>
              )}
              {wishlist.map((p, index) => (
                <div key={p.id} className="product-card">
                  <div
                    className="card-img"
                    style={{ cursor: "pointer" }}
                    onClick={() => (window.location.href = `/products/${p.id}`)}
                  >
                    <img
                      src={
                        p.first_image
                          ? `/images/products/uploads/${p.first_image}`
                          : "/images/no-image.jpg"
                      }
                      alt={p.name}
                    />
                    <button
                      className="btn trash"
                      onClick={async (e) => {
                        e.preventDefault(); // 阻止預設行為
                        e.stopPropagation(); // 阻止事件冒泡

                        const result = await swalConfirm(
                          "商品",
                          "確定要取消此商品的追蹤嗎？",
                          {
                            confirmButtonText: "確定",
                            cancelButtonText: "取消",
                            confirmButtonColor: "var(--Danger500)",
                            cancelButtonColor: "#4d4d4d",
                          }
                        );

                        // 如果用戶取消，直接返回
                        if (!result.isConfirmed) return;

                        try {
                          const token = localStorage.getItem("reactLoginToken");
                          const res = await fetch(
                            `${API_URL}/api/users/wishlist/${p.id}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );

                          const result = await res.json();
                          if (result.status === "success") {
                            // 更新狀態而不是重新載入整個頁面
                            setWishlist(
                              wishlist.filter((item) => item.id !== p.id)
                            );
                            await swalSuccess("取消", "已取消該追蹤商品");
                          } else {
                            // alert(result.message || "移除失敗");
                            await swalError(
                              "取消",
                              result.message || "取消失敗"
                            );
                          }
                        } catch (error) {
                          console.error("移除追蹤錯誤:", error);
                          // alert("移除失敗，請稍後再試");
                          await swalError("系統錯誤", "取消失敗，請稍後再試");
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  <div className="card-body">
                    <div
                      className="card-title"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        (window.location.href = `/products/${p.id}`)
                      }
                    >
                      {p.name}
                    </div>
                    <div className="card-bottom">
                      <p className="price">${p.price}</p>
                      <button
                        className="btn btnCart"
                        onClick={async () => {
                          // 統一加入購物車資料結構
                          const cart = JSON.parse(
                            localStorage.getItem("cartItems") || "[]"
                          );
                          const exist = cart.find((i) => i.id === p.id);
                          const cartProduct = {
                            id: p.id,
                            product_name: p.name || p.product_name || "",
                            price: p.price,
                            images:
                              p.images ||
                              (p.first_image ? [{ file: p.first_image }] : []),
                            intro: p.intro || "",
                            introImages: p.introImages || [],
                            brand_id: p.brand_id,
                            brand_name: p.brand_name,
                            model: p.model,
                            qty: 1,
                          };
                          let newCart;
                          if (exist) {
                            newCart = cart.map((i) =>
                              i.id === p.id ? { ...i, qty: i.qty + 1 } : i
                            );
                          } else {
                            newCart = [...cart, cartProduct];
                          }
                          localStorage.setItem(
                            "cartItems",
                            JSON.stringify(newCart)
                          );
                          // alert("已加入購物車");
                          await swalSuccess(
                            "加入購物車",
                            "商品已成功加入購物車！"
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        <FontAwesomeIcon icon={faCartShopping} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
