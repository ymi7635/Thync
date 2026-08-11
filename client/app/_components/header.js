"use client";
// 全站共用的頁首導覽列（Logo、選單、會員狀態、購物車）
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import HeaderUser from "./headerUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCartShopping, faBars, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const router = useRouter()
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [keyword, setKeyword] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (!keyword.trim()) return
    router.push(`/products?search=${encodeURIComponent(keyword)}`)
  }


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header >
        {isMobile ? (
          // 手機版結構
          <div className="container header pb-2">

            <div className="logo d-flex justify-content-center">
              <a className="navbar-brand" href="/">
                <Image
                  src="/images/LOGO.png"
                  alt="Logo"
                  width={129}
                  height={40}
                />
              </a>
            </div>

            <div className="navbar ">
              <div className="container d-flex justify-content-start flex-nowrap gap-1 align-items-center">

                {/* 漢堡改 dropdown */}
                <div className="dropdown">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    id="mobileMenuDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="">
                      <FontAwesomeIcon
                        icon={faBars}
                        className="icon-nav"
                      /></span>
                  </button>
                  <ul className="dropdown-menu w-100" aria-labelledby="mobileMenuDropdown">
                    <li>
                      <Link
                        href="/products"
                        className={`dropdown-item${pathname === "/products" ? " active" : ""}`}
                      >
                        所有商品
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/brands"
                        className={`dropdown-item${pathname === "/products/brands" ? " active" : ""
                          }`}
                      >
                        所有品牌
                      </Link>
                    </li>
                    <li>
                      <a className="dropdown-item" aria-current="page" href="/#events">
                        活動消息
                      </a>
                    </li>
                    <li>
                      <Link
                        href="/products/sales"
                        className={`dropdown-item${pathname === "/products/sales" ? " active" : ""
                          }`}
                      >
                        限時出清
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/articles"
                        className={`dropdown-item${pathname === "/articles" ? " active" : ""
                          }`}
                      >
                        文章分享
                      </Link>
                    </li>

                  </ul>
                </div>

                {/* 搜尋欄 */}
                <div className="d-flex align-items-center gap-2">
                  <form className="d-flex" role="search" onSubmit={handleSearch}>
                    <input
                      className="form-control search-input"
                      type="text"
                      placeholder="搜尋商品......"
                      value={keyword}
                      aria-label="Search"
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button className="btn" type="submit">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="icon-search"
                      />
                    </button>
                  </form>

                  {/* 購物車按鈕 */}
                  <a href="/cart" className="btn line-height-1">
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      className="icon-cart"
                    />
                  </a>

                  {/* 登入 */}
                  <div className="user">
                    {user ? (
                      <HeaderUser />
                    ) : (
                      <div className="dropdown">
                        <button
                          className="btn dropdown-toggle"
                          type="button"
                          id="mobileMenuDropdown"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <span className="">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="icon-user"
                            /></span>
                        </button>

                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-user">
                          <Link href="/user/login" className="dropdown-item">
                            登入
                          </Link>
                          <Link href="/user/add" className="dropdown-item">
                            註冊
                          </Link>
                        </div>

                        {/* {" "}
                        <Link href="/user/login" className="btn link">
                          登入
                        </Link>{" "}
                        <Link href="/user/add" className="btn link">
                          註冊
                        </Link>{" "} */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          // 桌機版結構
          <div className="container header">
            <nav className="navbar ">
              <div className="container-fluid">
                <a className="navbar-brand" href="/">
                  <Image
                    src="/images/LOGO.png"
                    alt="Logo"
                    width={129}
                    height={40}
                  />
                </a>
                <div className="d-flex align-items-center gap-2">
                  <form className="d-flex" role="search" onSubmit={handleSearch}>
                    <input
                      className="form-control search-input me-2"
                      type="text"
                      placeholder="搜尋商品......"
                      value={keyword}
                      aria-label="Search"
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button className="btn" type="submit">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="icon-search"
                      />
                    </button>
                  </form>
                  <a href="/cart" className="btn">
                    <FontAwesomeIcon
                      icon={faCartShopping}
                      className="icon-cart"
                    />
                  </a>
                  <div className="user">
                    {user ? (
                      <HeaderUser />
                    ) : (
                      <>
                        {" "}
                        <Link href="/user/login" className="btn link">
                          登入
                        </Link>{" "}
                        <Link href="/user/add" className="btn link">
                          註冊
                        </Link>{" "}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            <nav className="navbar navbar-expand-md ">
              <div className="w-100">
                <ul className="navbar-nav w-100 text-center">
                  <li className="nav-item">
                    <Link
                      href="/products"
                      className={`nav-link${pathname === "/products" ? " active" : ""}`}
                    >
                      所有商品
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/products/brands"
                      className={`nav-link${pathname === "/products/brands" ? " active" : ""
                        }`}
                    >
                      所有品牌
                    </Link>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" aria-current="page" href="/#events">
                      活動消息
                    </a>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/products/sales"
                      className={`nav-link${pathname === "/products/sales" ? " active" : ""
                        }`}
                    >
                      限時出清
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      href="/articles"
                      className={`nav-link${pathname === "/articles" ? " active" : ""
                        }`}
                    >
                      文章分享
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
