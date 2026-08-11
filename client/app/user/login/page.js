"use client";
// 會員登入頁

import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import styles from "@/styles/login.css";
import "@/styles/loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouseChimney,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { swalError, swalSuccess } from "@/utils/swal";
import { API_URL } from "@/utils/api";

export default function UserLoginPage() {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(true);
  const [isProcessingGoogleLogin, setIsProcessingGoogleLogin] = useState(false);
  const { login, loginWithToken, user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const animationRef = useRef(null);

  // 跳轉會員中心
  useEffect(() => {
    if (!isLoading && user && !window.location.hash.includes("access_token")) {
      window.location.href = "/user";
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (lottieLoaded || window.lottie) {
      initializeLottie();
    }
  }, [lottieLoaded]);

  // 處理 Google 登入回傳
  useEffect(() => {
    // 檢查 URL 是否有 Google 回傳的 token
    const hash = window.location.hash;
    console.log("當前 URL hash:", hash);

    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const state = params.get("state");

      console.log("找到 access_token:", accessToken);
      console.log("state:", state);

      if (accessToken && state === "google_login") {
        setIsProcessingGoogleLogin(true);
        handleGoogleCallback(accessToken);
      }
    }
  }, []);

  const handleGoogleCallback = async (accessToken) => {
    try {
      console.log("=== 開始處理 Google 回傳 ===");

      // 1. 用 access_token 取得使用者資訊
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      const userInfo = await userResponse.json();
      console.log("Google 使用者資訊:", userInfo);

      // 2. 發送到我們的後端
      const response = await fetch(
        `${API_URL}/api/users/google-login-simple`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            googleId: userInfo.id,
          }),
        }
      );

      const data = await response.json();
      console.log("後端回應:", data);

      if (data.success) {
        console.log("準備呼叫 loginWithToken");
        await loginWithToken(data.data.token, data.data.user);

        await swalSuccess(
          "登入成功",
          `歡迎回來，${data.data.user.account || userInfo.account}！`
        );

        // 清除 URL hash
        window.location.hash = "";
        setIsProcessingGoogleLogin(false);
        window.location.href = "/user";
      } else {
        // alert("登入失敗：" + data.message);
        await swalError("登入失敗", data.message || "請稍後再試");
        setIsProcessingGoogleLogin(false);
      }
    } catch (error) {
      console.error("Google 登入錯誤:", error);
      await swalError("登入過程發生錯誤");
      setIsProcessingGoogleLogin(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = "http://localhost:3000/user/login";

    console.log("Client ID:", clientId);
    console.log("Redirect URI:", redirectUri);
    console.log("當前頁面 URL:", window.location.href);

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("scope", "email profile");
    googleAuthUrl.searchParams.set("response_type", "token");
    googleAuthUrl.searchParams.set("state", "google_login");

    console.log("完整 Google Auth URL:", googleAuthUrl.toString());
    window.location.href = googleAuthUrl.toString();
  };

  const onclick = async () => {
    await login(mail, password);
  };

  // Lottie 動畫初始化
  const initializeLottie = () => {
    if (typeof window !== "undefined" && window.lottie) {
      // 載入 Lottie 動畫
      animationRef.current = window.lottie.loadAnimation({
        // 放置 SVG 的容器
        container: document.querySelector("#lottie-animation"),
        // 使用 SVG 渲染（建立 SVG）
        renderer: "svg",
        loop: true,
        autoplay: true,
        // 動畫的 JSON 檔
        path: "/wave.json", // 注意路徑改為 /wave.json
      });

      // 動畫載入完成後設定遮罩
      animationRef.current.addEventListener("DOMLoaded", function () {
        setupMask();
        setAnimationReady(true);
      });
    }
  };

  const setupMask = () => {
    // Lottie 產生的 <svg>
    const animationSVG = document.querySelector("#lottie-animation svg");
    // 白色遮罩群組
    const maskContent = document.querySelector("#mask-content");
    const backgroundImage = document.querySelector(".background-image");

    if (animationSVG && maskContent) {
      // 深層拷貝動畫
      const clonedContent = animationSVG.cloneNode(true);

      // 清空遮罩
      maskContent.innerHTML = "";
      // 深層拷貝所有子節點到遮罩
      [...clonedContent.children].forEach((child) => {
        maskContent.appendChild(child.cloneNode(true));
      });

      // 使用 Lottie 動畫作為遮罩
      backgroundImage.style.mask = "url(#lottie-mask)";

      // Lottie 每播放一個影格就觸發一次
      animationRef.current.addEventListener("enterFrame", function () {
        updateMask();
      });
    }
  };

  const updateMask = () => {
    const animationSVG = document.querySelector("#lottie-animation svg");
    const maskContent = document.querySelector("#mask-content");

    // 每次更新把目前動畫的 SVG 子節點複製到遮罩
    if (animationSVG && maskContent) {
      maskContent.innerHTML = "";
      [...animationSVG.children].forEach((child) => {
        const cloned = child.cloneNode(true);
        // 確保遮罩元素是白色的
        // 確保遍歷子節點時，不要設定到其中的文字節點、註解節點（沒有 setAttribute 屬性）
        if (cloned.setAttribute) {
          // 強制子節點的 fill、stroke 為白色
          cloned.setAttribute("fill", "white");
          cloned.setAttribute("stroke", "white");
        }
        maskContent.appendChild(cloned);
      });
    }
    if (!animationSVG || !maskContent) return;

    // 取得動畫原始大小
    // 取得 SVG 內部 viewBox 格式 "minX minY width height" 轉陣列
    const viewBox = animationSVG.getAttribute("viewBox");
    if (viewBox) {
      const viewBoxArray = viewBox.split(" ");
      // parseFloat 轉數字
      const animWidth = parseFloat(viewBoxArray[2]);
      const animHeight = parseFloat(viewBoxArray[3]);

      // 取得容器大小
      const container = document.querySelector(".container1");
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // 計算縮放比例，把 SVG 動畫剛好填滿容器
        const scaleX = containerWidth / animWidth;
        const scaleY = containerHeight / animHeight;

        // 設置縮放使遮罩填滿容器
        maskContent.setAttribute(
          "transform",
          `scale(${scaleX}, ${scaleY}) translate(-200, 0)`
        );
      }
    }
  };

  // 清理動畫資源
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return <div className="loader"></div>;
  }

  return (
    <div className="position-relative">
      {/* 載入 Lottie 腳本 */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          setLottieLoaded(true);
          initializeLottie();
        }}
      />

      <div className="container1">
        <div className="left">
          <div className="block1">
            <div className="header">
              <div className="d-flex align-items-center justify-content-between">
                <img src="/images/LOGO.png" alt="LOGO" />
                <a
                  onClick={() => (window.location.href = "/")}
                  className="home-link"
                  aria-label="回到首頁"
                  style={{
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHouseChimney}
                    className="home-icon"
                  />
                </a>
              </div>

              <h1 className="register-title">會員登入</h1>
              <div className="toggle">
                <a
                  className="toggle-active"
                  onClick={() => (window.location.href = "/user/login")}
                >
                  登入
                </a>
                <a
                  className="toggle-link"
                  onClick={() => (window.location.href = "/user/add")}
                >
                  註冊
                </a>
              </div>
            </div>
            <main>
              <form
                id="login-form"
                autoComplete="on"
                onSubmit={(e) => {
                  e.preventDefault();
                  onclick();
                }}
              >
                {/* 信箱 */}
                <div className="field">
                  <label htmlFor="mail" className="label">
                    信箱
                  </label>
                  <input
                    id="mail"
                    name="mail"
                    type="email"
                    className="input"
                    autoComplete="email"
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    required
                  />
                </div>

                {/* 密碼 */}
                <div className="field">
                  <label htmlFor="password" className="label">
                    密碼
                  </label>
                  <div className="password-block">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <i
                      className={
                        showPassword
                          ? "fa-solid fa-eye"
                          : "fa-solid fa-eye-slash"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                    ></i>
                  </div>
                </div>

                <a href="/user/forgot-password" className="link forget">
                  忘記密碼
                </a>

                {/* 按鈕 */}
                <button className="btn-primary" type="submit">
                  <i className="fa-solid fa-right-to-bracket"></i>
                  &nbsp;登入
                </button>

                <div className="divider">或</div>

                <div className="d-flex align-items-center justify-content-between">
                  <p className="signin">
                    還不是會員？{" "}
                    <a href="/user/add" className="link2">
                      立即註冊！
                    </a>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleGoogleLogin}
                  disabled={!isGoogleLoaded}
                >
                  <img src="/images/users/Google Logo.png" alt="" />

                  <span>
                    {isGoogleLoaded
                      ? "使用 Google 帳號登入"
                      : "載入 Google 登入中..."}
                  </span>
                </button>
              </form>
            </main>
          </div>
        </div>

        <div className="hidden">
          {/* 背景圖片 */}
          <div
            className="background-image"
            style={{ display: animationReady ? "block" : "none" }}
          ></div>

          {/* 隱藏的 SVG 用於遮罩定義 */}
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              {/* 定義遮罩規則：白色=顯示、黑色=隱藏、灰色=半透明 */}
              <mask id="lottie-mask">
                {/* 先把整塊變黑 */}
                <rect width="100%" height="100%" fill="black" />
                {/* 拷貝 Lottie SVG 內容產生圖形，變成白色區塊 */}
                <g id="mask-content" fill="white" transform="scale(-1,1)"></g>
              </mask>
            </defs>
          </svg>

          {/* 隱藏的 Lottie 動畫 */}
          <div className="lottie-mask" id="lottie-animation"></div>
        </div>
      </div>

      <div className="round"></div>
      <div className="bottom">
        <a href="/admin/login" className="secret-block">
          <FontAwesomeIcon icon={faUserSecret} className="faUserSecret" />
        </a>
      </div>
    </div>
  );
}
