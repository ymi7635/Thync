"use client";
// 購物車商品明細表格（調整數量、移除商品）

import "./cart.css";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

export default function CartTable({ items, onQtyChange, onRemove }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  if (isMobile) {
    return (
      <div className="cart-cards">
        <span className="mobile-label">商品明細</span>
        {items.map((item, i) => (
          <div key={i} className="cart-card">
            <div className="cart-card-row">
              {/* 左側：商品圖 + 名稱 */}
              <div className="left">
                <img
                  src={`/images/products/uploads/${item.images[0]?.file}`}
                  alt={item.product_name}
                />
              </div>

              {/* 右側：價錢 + 數量控制 + 刪除 */}
              <div className="right">
                <p className="name">{item.product_name}</p>
                <div className="d-flex align-items-center w-100">
                  <div className="d-flex align-items-center flex-column gap-2">
                    <div className="price">${item.price || 0}</div>
                    <div className="qty-control">
                      <button onClick={() => onQtyChange(item, -1)}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => onQtyChange(item, 1)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  <button className="btn-remove ms-auto" onClick={() => onRemove(item)}>
                    <FontAwesomeIcon icon={fas.faTrash} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <table className="cart-table">
      <thead>
        <tr>
          <th>商品明細</th>
          <th>價格</th>
          <th>數量</th>
          <th>小計</th>
          <th>修改明細</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td className="product-info">
              <img
                src={`/images/products/uploads/${item.images[0]?.file}`}
                alt={item.product_name}
              />
              <span>{item.product_name}</span>
            </td>
            <td>${item.price || 0}</td>
            <td className="qty-control">
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => onQtyChange(item, -1)}
                  className="btn btn-outline-secondary"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span>{item.qty || 1}</span>
                <button
                  onClick={() => onQtyChange(item, 1)}
                  className="btn btn-outline-secondary"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </td>
            <td>${(item.price || 0) * (item.qty || 1)}</td>
            <td>
              <button className="btn-remove" onClick={() => onRemove(item)}>
                刪除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
