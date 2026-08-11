"use client";
// 【後台】/admin/* 底下所有頁面共用的版型，負責提供 AdminAuthProvider

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import "../../styles/admin.css";

const NAV_ITEMS = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/orders", label: "訂單管理" },
  { href: "/admin/users", label: "會員管理" },
  { href: "/admin/coupons", label: "優惠券管理" },
  { href: "/admin/articles", label: "文章管理" },
];

// 統一的登入檢查 + 版面外殼。所有 /admin/* 頁面都套用同一份，
// 不用再各自複製一次「檢查 token → 沒登入就導回登入頁」的邏輯，
// 也不用各自 import Header/Footer，畫面才不會每頁長得不一樣。
function AdminGate({ children }) {
  const { admin, isLoading, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !admin && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [isLoading, admin, isLoginPage, router]);

  // 登入頁自己有一整套畫面（Lottie 動畫等），不需要外殼，直接原樣顯示
  if (isLoginPage) return children;

  // 驗證中，或還沒登入即將被導頁：先不渲染任何後台內容，避免畫面閃一下
  if (isLoading || !admin) return null;

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link href="/admin" className="admin-topbar-brand">
          Thync 後台管理
        </Link>
        <nav className="admin-topbar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-topbar-user">
          <span>{admin?.name || admin?.account}</span>
          <button onClick={logout} className="admin-topbar-logout">
            登出
          </button>
        </div>
      </header>
      <div className="admin-shell-content">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  );
}
