"use client";
// 購物車系列頁面底部的商品推薦清單

import "./cartShared.css";
import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faPlus } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from "@/utils/api";

export default function RecommendList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecommend = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/products?limit=20`);
        const result = await res.json();
        if (isMounted && result.status === "success") {
          setProducts(result.data || result.products || []);
        }
      } catch (err) {
        console.error("推薦商品抓取失敗:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRecommend();
    return () => {
      isMounted = false;
    };
  }, []); // 只跑一次

  const recommend = useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [products]);
  console.log(recommend)
  if (isLoading) return <div>載入中...</div>;

  return (
    <section className="recommend-section">
      <div className="recommend-title">
        <i className="fa-solid fa-heart"></i> 你可能會感興趣的...
      </div>
      <div className="recommend-list">
        {recommend.map((p) => {
          {/* console.log(p);// 這裡純粹是在確認 p 物件內容by光 */}
          return (
            <div key={p.id} className="recommend-item">
              <img
                src={`/images/products/uploads/${p.first_image
                  }`}
                alt={p.name}
              />
              <p className="recommend-item-title">{p.name}</p>
              <div className="recommend-item-footer">
                <div className="recommend-price">${p.price}</div>
                <button
                  className="btn recommend-btn"
                  onClick={() => {
                    // 統一加入購物車資料結構
                    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
                    const exist = cart.find((i) => i.id === p.id);
                    const cartProduct = {
                      id: p.id,
                      product_name: p.name || p.product_name || "",
                      price: p.price,
                      images: p.images || (p.first_image ? [{ file: p.first_image }] : []),
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
                    localStorage.setItem("cartItems", JSON.stringify(newCart));
                    alert("已加入購物車");
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <FontAwesomeIcon icon={faCartShopping} />
                </button>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}
