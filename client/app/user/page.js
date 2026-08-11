"use client";
// 會員中心首頁

import styles from "@/styles/user-center.css";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb";
import Sidebar from "@/app/_components/user/sidebar";
import Footer from "@/app/_components/footer";

export default function UserEditPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // 沒有登入不能夠觀看1
  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/user/login";
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  if (user) {
    return (
      <div>
        <Header />
        <div className="d-md-flex flex-md-row flex-column container mt-md-4 mb-4">
          {/* 電腦版 */}
          <Sidebar />

          <div className="main-content">
            <div className="breadcrumb">
              <Breadcrumb />
            </div>
            {/* 手機版 */}
            <div className="d-md-none d-flex flex-row justify-content-between">
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
              <button className="logout" onClick={logout}>
                <i className="fa-solid fa-right-to-bracket"></i>登出
              </button>
            </div>

            <hr />

            <div className="middle-content">
              <h1>會員中心</h1>
              <div className="tiles">
                <Link href="/user/edit" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-user"></i>
                    <div className="label">會員資料管理</div>
                  </div>
                </Link>
                <Link href="/user/order" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-gift"></i>
                    <div className="label">訂單查詢</div>
                  </div>
                </Link>
                {/* <Link href="#" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-bell"></i>
                    <div className="label">貨到通知</div>
                  </div>
                </Link> */}
                <Link href="#" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-ticket"></i>
                    <div className="label">我的優惠券</div>
                  </div>
                </Link>
                <Link href="/user/wishlist" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-heart"></i>
                    <div className="label">追蹤商品</div>
                  </div>
                </Link>
                <Link href="/user/favorites" className="tile">
                  <div className="inner">
                    <i className="fa-solid fa-bookmark"></i>
                    <div className="label">已收藏文章</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
