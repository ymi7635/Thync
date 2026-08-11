// 會員中心頁面共用的左側選單（個人資料/訂單/收藏/優惠券）
import React from "react";
import Link from "next/link";
import styles from "@/styles/user-center.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <div className="sidebar me-4 d-md-flex d-none">
        <div className="upper">
          <div className="profile">
            <div className="avatar-wrapper">
              <div className="avatar">
                <img
                  src={
                    user?.img
                      ? user.img.startsWith("data:")
                        ? user.img
                        : user.img.startsWith("http")
                        ? user.img
                        : `/images/users/user-photo/${user.img}`
                      : "/images/users/user-photo/user.jpg"
                  }
                  alt="avatar"
                />
              </div>
            </div>
            <div className="greet">
              <div className="greet-word">您好！</div>
              <div className="user-name">{user?.account}</div>
            </div>
          </div>
          <nav className="menu">
            <Link
              href="/user/edit"
              className={`mb-1 menu-link${
                pathname.startsWith("/user/edit") ? " active" : ""
              }`}
            >
              <i className="fa-solid fa-user min-w-18"></i>會員資料管理
            </Link>
            <Link
              href="/user/order"
              className={`mb-1 menu-link${
                pathname === "/user/order" ? " active" : ""
              }`}
            >
              <span className="icon">
                <i className="fa-solid fa-gift min-w-18"></i>
              </span>
              訂單查詢
            </Link>
            {/* <Link
              href="/user/notify"
              className={`mb-1 menu-link${
                pathname === "/user/notify" ? " active" : ""
              }`}
            >
              <span className="icon">
                <i className="fa-solid fa-bell"></i>
              </span>
              貨到通知
            </Link> */}
            <Link
              href="/user/coupon"
              className={`mb-1 menu-link${
                pathname === "/user/coupon" ? " active" : ""
              }`}
            >
              <span className="icon">
                <i className="fa-solid fa-ticket min-w-18"></i>
              </span>
              我的優惠券
            </Link>
            <Link
              href="/user/wishlist"
              className={`mb-1 menu-link${
                pathname === "/user/wishlist" ? " active" : ""
              }`}
            >
              <span className="icon">
                <i className="fa-solid fa-heart min-w-18"></i>
              </span>
              已追蹤商品
            </Link>
            <Link
              href="/user/favorites"
              className={`mb-1 menu-link${
                pathname === "/user/favorites" ? " active" : ""
              }`}
            >
              <span className="icon">
                <i className="fa-solid fa-bookmark min-w-18"></i>
              </span>
              已收藏文章
            </Link>
          </nav>
        </div>
        <button className="logout" onClick={logout}>
          <i className="fa-solid fa-right-to-bracket"></i>登出
        </button>
      </div>
    </>
  );
}
