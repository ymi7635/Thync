"use client";
// 前台商品詳情頁
import style from "@/styles/products.css";
// 我偷偷放我弄的 loader css 進來
import "@/styles/loader.css";
import { useProduct } from "@/hooks/use-product";
import { use, useEffect, useState } from "react";
import Breadcrumb from "@/app/_components/breadCrumb";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faCashRegister,
  faCartShopping,
  faHeart,
  faHeartCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/utils/api";

export default function ProductDetail({ params }) {
  const { user } = useAuth();
  const { pid } = use(params);
  const { product, getOne, isLoading } = useProduct();
  const [hasFetched, setHasFetched] = useState(false);
  const [mainImg, setMainImg] = useState(""); // 新增主圖 state
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false); // 收藏狀態
  console.log(product);

  useEffect(() => {
    if (pid) {
      getOne(pid).finally(() => setHasFetched(true));
    }
  }, [pid]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImg(product.images[0].file); // 預設第一張為主圖
    }
  }, [product]);

  // 檢查收藏狀態
  useEffect(() => {
    async function checkWishlistStatus() {
      if (!user || !product?.id) return;

      try {
        const token = localStorage.getItem("reactLoginToken");
        const res = await fetch(
          `${API_URL}/api/users/wishlist-status/${product.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(result.isWishlisted);
        }
      } catch (error) {
        console.error("檢查收藏狀態錯誤:", error);
      }
    }

    checkWishlistStatus();
  }, [user, product]);

  if (isLoading) {
    return <div className="loader container"></div>;
  }

  if (hasFetched && product === null) {
    return <p>沒有找到商品</p>;
  }

  if (!product) {
    // 初始 render 阻擋掉，避免「閃沒有商品」
    return null;
  }

  const images = product.images || [];
  const introImages = product.introImages || [];

  function handleAddToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const exist = cart.find((i) => i.id === product.id);
    let newCart;
    if (exist) {
      newCart = cart.map((i) =>
        i.id === product.id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      newCart = [...cart, { ...product, qty }];
    }

    localStorage.setItem("cartItems", JSON.stringify(newCart));
    console.log("getItem", localStorage.getItem("cartItems"));
    alert("已加入購物車");
  }

  // 切換收藏狀態
  async function handleToggleWishlist() {
    if (!user) {
      alert("請先登入");
      return;
    }

    try {
      const token = localStorage.getItem("reactLoginToken");

      if (isWishlisted) {
        // 移除收藏
        const res = await fetch(
          `${API_URL}/api/users/wishlist/${product.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(false);
        } else {
          alert(result.message || "移除收藏失敗");
        }
      } else {
        // 加入收藏
        const res = await fetch(
          `${API_URL}/api/users/add-wishlist`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId: product.id }),
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(true);
        } else {
          alert(result.message || "加入收藏失敗");
        }
      }
    } catch (error) {
      console.error("收藏操作錯誤:", error);
      alert("操作失敗，請稍後再試");
    } 
  }

  return (
    <>
      <Header />
      <main className="container P-detail">
        <Breadcrumb product={product} />
        <div className="area1">
          <div className="product-images">
            {/* 縮圖列 */}
            <div className="thumbnails" style={{}}>
              {images.map((img) => (
                <img
                  key={img.id}
                  src={`/images/products/uploads/${img.file}`}
                  alt={product.product_name}
                  onClick={() => setMainImg(img.file)}
                  className={mainImg === img.file ? "active" : ""}
                />
              ))}
            </div>
            {/* 主圖 */}
            <div className="main-image">
              {mainImg && (
                <img
                  src={`/images/products/uploads/${mainImg}`}
                  alt={product.product_name}
                />
              )}
            </div>
          </div>
          <div className="product-info">
            <div className="d-flex align-items-center justify-content-between gap- mb-2">
              <Link
                href={`/products?brand_id=${product.brand_id}`}
                className="brand-link text-decoration-none"
              >
                <h5 className="brand-name">{product.brand_name}</h5>
              </Link>
              <p className="product-model">商品型號：{product.model}</p>
            </div>

            <h5>{product.product_name}</h5>

            <div className="price">${product.price}</div>

            <div className="d-flex align-items-center gap-2 mb-md3">
              <p className="mb-0 me-2">數量</p>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="btn btn-outline-secondary qtyBtn"
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="btn btn-outline-secondary qtyBtn"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="d-flex gap-3 flex-wrap flex-column flex-md-row">
              <button
                onClick={() => handleAddToCart(product)}
                className="btn CartBtn"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                　加入購物車
              </button>
              <button className="btn CheckoutBtn">
                <FontAwesomeIcon icon={faCashRegister} />
                　直接結帳
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`btn ${
                  isWishlisted ? "btn-follow" : "btn-unfollow"
                }`}
              >
                <FontAwesomeIcon icon={isWishlisted ? faHeart : faHeartCirclePlus} />
                {isWishlisted ? "　已收藏" : "　收藏商品"}
              </button>
            </div>
          </div>
        </div>

        {/* 加購區 */}
        <div className="add-on"></div>

        <div className="area2">
          <div className="nav nav-tabs">
            <div className="nav-item" role="presentation">
              <button
                className="nav-link active"
                id="home-tab"
                data-bs-toggle="tab"
                data-bs-target="#introArea"
                type="button"
                role="tab"
                aria-controls="introArea"
                aria-selected="true"
              >
                商品介紹
              </button>
            </div>
            <div className="nav-item" role="presentation">
              <button
                className="nav-link"
                id="profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#spec"
                type="button"
                role="tab"
                aria-controls="spec"
                aria-selected="false"
              >
                商品規格
              </button>
            </div>
          </div>
          <div className="tab-content" id="myTabContent">
            <div
              id="introArea"
              className="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
              <div className="mt-2 preserve-format" id="introText">
                <pre>{product.intro}</pre>
              </div>
              <div className="" id="introImg">
                {introImages.map((img) => (
                  <img
                    key={img.id}
                    src={`/images/products/uploads/${img.file}`}
                    alt={product.product_name}
                  />
                ))}
              </div>
            </div>
            <div
              id="spec"
              className="tab-pane fade"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <div className=" mt-2 preserve-format">
                <pre>{product.spec}</pre>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
