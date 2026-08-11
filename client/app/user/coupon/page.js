"use client";
// 會員中心「我的優惠券」頁面

import styles from "@/styles/order.css";
import CouponArea from "@/app/_components/coupons/CouponArea";
import CouponAreaUsed from "@/app/_components/coupons/CouponAreaUsed";
import CouponAreaExpired from "@/app/_components/coupons/CouponAreaExpired";
import CouponAreaList from "@/app/_components/coupons/CouponAreaList";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb";
import Sidebar from "@/app/_components/user/sidebar";
import Footer from "@/app/_components/footer";

export default function UserCouponPage() {
  const { user, setUser } = useAuth();

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
            <div className="title">我的優惠券</div>

            <div className="nav nav-tabs user-coupon">
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
                  可使用
                </button>
              </div>
              <div className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="list-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#list"
                  type="button"
                  role="tab"
                  aria-controls="list"
                  aria-selected="true"
                >
                  未領取
                </button>
              </div>
              <div className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#used"
                  type="button"
                  role="tab"
                  aria-controls="used"
                  aria-selected="false"
                >
                  已使用
                </button>
              </div>
              <div className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="expired-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#expired"
                  type="button"
                  role="tab"
                  aria-controls="expired"
                  aria-selected="false"
                >
                  已過期
                </button>
              </div>
            </div>
            <div className="tab-content" id="myTabContent">
              <div
                id="introArea"
                className="tab-pane fade show active "
                role="tabpanel"
                aria-labelledby="home-tab"
              >
                <div className="mt-2 preserve-format" id="">
                  <CouponArea />
                </div>
              </div>

              <div
                id="list"
                className="tab-pane fade show "
                role="tabpanel"
                aria-labelledby="list-tab"
              >
                <div className="mt-2 preserve-format" id="">
                  <CouponAreaList />
                </div>
              </div>

              <div
                id="used"
                className="tab-pane fade"
                role="tabpanel"
                aria-labelledby="profile-tab"
              >
                <div className=" mt-2 preserve-format">
                  <CouponAreaUsed />
                </div>
              </div>
              <div
                id="expired"
                className="tab-pane fade"
                role="tabpanel"
                aria-labelledby="expired-tab"
              >
                <div className=" mt-2 preserve-format">
                  <CouponAreaExpired />
                </div>
              </div>
            </div>




          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
