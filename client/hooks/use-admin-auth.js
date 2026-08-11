"use client";
// 【後台】管理者登入狀態管理 hook（sessionStorage 存 token，關閉分頁即登出）

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/api";

const AdminAuthContext = createContext(null);
AdminAuthContext.displayName = "AdminAuthContext";

// sessionStorage 的鍵名（跟一般會員的 reactLoginToken 分開，避免混淆）
// 刻意用 sessionStorage 而不是 localStorage：關閉分頁/瀏覽器就會自動清空，
// 後台管理者每次重新打開網站都要重新登入，比一般會員的長期登入更嚴謹。
const appKey = "adminToken";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 登入
  const login = async (account, password) => {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account, password }),
    });
    const result = await res.json();
    if (result.status === "success") {
      sessionStorage.setItem(appKey, result.data.token);
      setAdmin(result.data.admin);
    }
    return result;
  };

  // 登出
  const logout = () => {
    sessionStorage.removeItem(appKey);
    setAdmin(null);
    router.replace("/admin/login");
  };

  // 取得目前 token，方便各頁面打 API 帶 Authorization header
  const getToken = () => sessionStorage.getItem(appKey);

  // 進入 admin 頁面時驗證 token 是否仍有效
  useEffect(() => {
    const checkStatus = async () => {
      const token = sessionStorage.getItem(appKey);
      if (!token) {
        setAdmin(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.status === "success") {
          setAdmin(result.data.admin);
        } else {
          sessionStorage.removeItem(appKey);
          setAdmin(null);
        }
      } catch (err) {
        console.error("[admin checkStatus] 錯誤:", err);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ admin, login, logout, getToken, isLoading }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
