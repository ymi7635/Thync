"use client";
// 頁首用的會員登入狀態小卡片（測試/示範用元件）

import { useAuth } from "@/hooks/use-auth";

export default function HeaderUser() {
  const { user, logout } = useAuth();
  // console.log(user);
  return (
    <>
      {user && (
        <>
          <div className="user">
            {/* <div className="account fs-3">{user.account}</div>
            <div className="mail">{user.mail}</div>
            <div className="d-flex">
              <div className="btn btn-primary ms-auto btn-logout" onClick={logout}>登出</div>
            </div> */}
          </div>

          <div className="dropdown">
            <a
              className="btn head"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
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
                alt="head img here"
              />
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start">
              <p className="dropdown-item-text user_account">{user.account}</p>
              <li>
                <a className="dropdown-item" href="/user/edit">
                  <i className="fa-solid fa-user min-w-18"></i>　會員資料管理
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/user/order">
                  <i className="fa-solid fa-gift min-w-18"></i>　訂單查詢
                </a>
              </li>
              {/* <li><a className="dropdown-item" href="#"><i className="fa-solid fa-bell"></i>　貨到通知</a></li> */}
              <li>
                <a className="dropdown-item" href="/user/coupon">
                  <i className="fa-solid fa-ticket min-w-18"></i>　我的優惠券
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/user/wishlist">
                  <i className="fa-solid fa-heart min-w-18"></i>　已追蹤商品
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/user/favorites">
                  <i className="fa-solid fa-bookmark min-w-18"></i>　已收藏文章
                </a>
              </li>
              <li>
                {" "}
                <a className="dropdown-item " onClick={logout}>
                  <i className="fa-solid fa-right-to-bracket min-w-18"></i>　登出
                </a>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
