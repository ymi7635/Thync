"use client"
// 商品列表用的單一商品卡片元件
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faPlus } from '@fortawesome/free-solid-svg-icons'


export default function ProductCard({ p }) {
  const router = useRouter()

  return (
    <>
      <div className="product-card">
        <div
          className="card-img"
          style={{ cursor: "pointer" }}
          onClick={() => window.location.href = `/products/${p.id}`}
        >
          <img
            src={
              p.first_image
                ? `/images/products/uploads/${p.first_image}`
                : "/images/no-image.jpg"
            }
            alt={p.name}
          />
        </div>
        <div className="card-body">
          <div
            className="card-title"
            style={{ cursor: "pointer" }}
            onClick={() => window.location.href = `/products/${p.id}`}
          >
            {p.name}
          </div>
          <div className="card-bottom">
            <p className="price">${p.price}</p>
            <button
              className="btn btnCart"
              onClick={() => {
                // 轉換 p 物件為細節頁一致格式
                const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
                const exist = cart.find((i) => i.id === p.id);
                // 統一欄位
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

      </div>
    </>

  )
}