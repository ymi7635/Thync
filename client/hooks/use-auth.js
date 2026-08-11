"use client";
// 一般會員登入狀態管理 hook（localStorage 存 token，含 Google 登入）

import { createContext, useContext, useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { usePathname, useRouter } from "next/navigation";
import { swalSuccess, swalError } from "@/utils/swal";
import { API_URL } from "@/utils/api";

const AuthContext = createContext(null);
AuthContext.displayName = "AuthContext";
// localStorage 的鍵名
const appKey = "reactLoginToken";

export function AuthProvider({ children }) {
  // 目前登入的使用者
  const [user, setUser] = useState(null);
  // 所有使用者列表
  const [users, setUsers] = useState([]);
  // 這裡只要useState裡面有東西，他就會是登入狀態
  const [isLoading, setIsLoading] = useState(true);

  // 設定路由導航規則
  const router = useRouter();
  const pathname = usePathname();
  const loginRoute = "/user/login";
  // 定義需登入才能訪問的路由列表
  const protectedRoutes = ["/user"];

  // 登入
  const login = async (mail, password) => {
    try {
      const API = `${API_URL}/api/users/login`;
      // 創建表單資料物件模仿 HTML 表單提交的資料格式
      const formData = new FormData();
      // 添加 key value pair 資料
      formData.append("mail", mail);
      formData.append("password", password);
      // 這裡的formData是用來傳送表單資料的

      const res = await fetch(API, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      // 這裡的result是從API回傳的資料
      console.log("login result:", result);
      if (result.status === "success") {
        console.log("登入成功");
        // alert(result.message);
        await swalSuccess("登入成功", `歡迎回來，${result.data.user.account}`);

        const token = result.data.token;
        const basicUser = result.data.user;

        // 存 token 到瀏覽器的 localStorage
        localStorage.setItem(appKey, token);
        // 這樣下次進來的時候就可以從localStorage裡面取出token

        // 再去拿完整 profile
        const profileRes = await fetch(
          `${API_URL}/api/users/${basicUser.account}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const profile = await profileRes.json();

        // 這裡的setUser是用來設定登入後的使用者資料
        if (profile.status === "success") {
          setUser(profile.data); // 完整 user
        } else {
          setUser(basicUser); // fallback
        }

        window.location.href = "/user";
      } else {
        // console.log("登入失敗");
        await swalError("登入失敗", result.message || "請檢查帳號密碼");
      }
    } catch (error) {
      console.error("login error:", error);
      await swalError("登入錯誤", error.message || "伺服器錯誤");
    }
  };

  // 登出
  const logout = async () => {
    console.log("logout");
    const API = `${API_URL}/api/users/logout`;
    const token = localStorage.getItem(appKey);
    try {
      if (!token) throw new Error("Token不存在");
      const res = await fetch(API, {
        method: "POST",
        // 前端把 Token 放入 Authorization Header 欄位
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.status === "success") {
        const token = result.data;
        setUser(null);
        localStorage.removeItem(appKey);
        localStorage.removeItem("cartItems"); // 登出時清空購物車
      } else {
        throw new Error(result.message);
      }
      // 即使登出失敗，還是要強制清除狀態
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem(appKey);
      localStorage.removeItem("cartItems"); // 登出時清空購物車
      window.location.href = "/user/login";
    }
  };
  // 註冊
  const add = async (account, mail, password) => {
    try {
      const API = `${API_URL}/api/users`;
      const formData = new FormData();
      formData.append("account", account);
      formData.append("mail", mail);
      formData.append("password", password);

      const res = await fetch(API, { method: "POST", body: formData });
      const result = await res.json();
      console.log("register result:", result);

      if (result.status === "success") {
        console.log("註冊成功");

        await swalSuccess("註冊成功", "歡迎您成為我們的會員");
        window.location.href = "/user/login";
      } else {
        console.log("註冊失敗");
        await swalError("註冊失敗", result.message || "請檢查輸入的資料");
      }
    } catch (error) {
      console.log("註冊失敗");
      console.error("register error:", error);
    }
  };

  const list = async () => {
    const API = `${API_URL}/api/users`;

    try {
      const res = await fetch(API);
      const result = await res.json();
      console.log(result);

      if (result.status === "success") {
        setUsers(result.data);
      }
    } catch (error) {
      console.log(`使用者列表取得: ${error.message}`);
      // 以防保留上次載入的使用者列表
      setUsers([]);
      alert(error.message);
    }
  };

  // 驗證登入狀態 & 同步最新 user 資料
  useEffect(() => {
    const checkToken = async () => {
      const API = `${API_URL}/api/users/status`;
      const token = localStorage.getItem(appKey);
      console.log("[checkToken] localStorage token:", token);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        console.log("[checkToken] 沒有 token，user=null，isLoading=false");
        return;
      }
      try {
        const res = await fetch(API, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        console.log("[checkToken] status result:", result);
        if (result.status === "success") {
          const newToken = result.data.token;
          const basicUser = result.data.user;
          console.log("[checkToken] newToken:", newToken);
          console.log("[checkToken] basicUser:", basicUser);

          // 存新的 token
          localStorage.setItem(appKey, newToken);

          // 再去撈完整 user profile
          const profileRes = await fetch(
            `${API_URL}/api/users/${basicUser.account}`,
            { headers: { Authorization: `Bearer ${newToken}` } }
          );
          const profile = await profileRes.json();
          console.log("[checkToken] profile:", profile);

          if (profile.status === "success") {
            setUser(profile.data);
            console.log("[checkToken] setUser(profile.data):", profile.data);
          } else {
            setUser(basicUser);
            console.log("[checkToken] setUser(basicUser):", basicUser);
          }
        } else {
          // ⚠️ 這裡修改：不要立刻登出，保留現有 user
          console.warn("[checkToken] status 驗證失敗，保留現有登入狀態");
        }
      } catch (error) {
        console.error("[checkToken] status check error:", error);
        // ⚠️ 這裡修改：不要立刻登出，保留現有 user
      } finally {
        setIsLoading(false);
        console.log("[checkToken] isLoading=false");
      }
    };
    // 只有有 token 才呼叫 checkToken
    if (localStorage.getItem(appKey)) {
      checkToken();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // 路由保護
  useEffect(() => {
    const token = localStorage.getItem(appKey);
    if (!isLoading && !user && !token && protectedRoutes.includes(pathname)) {
      window.location.href = "/user/login";
    }
  }, [isLoading, user, pathname]);

  const loginWithToken = async (token, user) => {
    try {
      console.log("loginWithToken token:", token, "user:", user);
      // 直接設定 token 和 user，不需要再呼叫 API
      localStorage.setItem(appKey, token);
      setUser(user);
    } catch (error) {
      console.error("loginWithToken error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithToken,
        logout,
        isLoading,
        list,
        users,
        setUser,
        add,
      }}
    >
      {/* 這裡的第一個大括號表示要寫程式，第二個大括號表示要寫物件 */}

      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// 省略大括號，原本應該是{useContext(AuthContext)}
