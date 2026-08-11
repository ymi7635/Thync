"use client";
// 【後台】管理者登入頁

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouseChimney, faLock } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/login.css";
import Script from "next/script";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { admin, login, isLoading: authLoading } = useAdminAuth();
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const animationRef = useRef(null);

  // 已經登入的話直接跳去後台首頁，不用再登入一次
  useEffect(() => {
    if (!authLoading && admin) {
      router.replace("/admin");
    }
  }, [authLoading, admin, router]);

  useEffect(() => {
    if (lottieLoaded || window.lottie) {
      initializeLottie();
    }
  }, [lottieLoaded]);

  const initializeLottie = () => {
    if (typeof window !== "undefined" && window.lottie) {
      animationRef.current = window.lottie.loadAnimation({
        container: document.querySelector("#lottie-animation"),
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/wave.json",
      });

      animationRef.current.addEventListener("DOMLoaded", function () {
        setupMask();
      });
    }
  };

  const setupMask = () => {
    const animationSVG = document.querySelector("#lottie-animation svg");
    const maskContent = document.querySelector("#mask-content");
    const backgroundImage = document.querySelector(".background-image");

    if (animationSVG && maskContent) {
      const clonedContent = animationSVG.cloneNode(true);
      maskContent.innerHTML = "";
      [...clonedContent.children].forEach((child) => {
        maskContent.appendChild(child.cloneNode(true));
      });
      backgroundImage && (backgroundImage.style.mask = "url(#lottie-mask)");

      animationRef.current.addEventListener("enterFrame", function () {
        updateMask();
      });
    }
  };

  const updateMask = () => {
    const animationSVG = document.querySelector("#lottie-animation svg");
    const maskContent = document.querySelector("#mask-content");

    if (animationSVG && maskContent) {
      maskContent.innerHTML = "";
      [...animationSVG.children].forEach((child) => {
        const cloned = child.cloneNode(true);
        if (cloned.setAttribute) {
          cloned.setAttribute("fill", "white");
          cloned.setAttribute("stroke", "white");
        }
        maskContent.appendChild(cloned);
      });
    }
    if (!animationSVG || !maskContent) return;

    const viewBox = animationSVG.getAttribute("viewBox");
    if (viewBox) {
      const viewBoxArray = viewBox.split(" ");
      const animWidth = parseFloat(viewBoxArray[2]);
      const animHeight = parseFloat(viewBoxArray[3]);

      const container = document.querySelector(".container1");
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const scaleX = containerWidth / animWidth;
        const scaleY = containerHeight / animHeight;
        maskContent.setAttribute(
          "transform",
          `scale(${scaleX}, ${scaleY}) translate(-200, 0)`
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      if (result.status === "success") {
        window.location.href = "/admin";
      } else {
        setError(result.message || "帳號或密碼錯誤");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("管理者登入錯誤:", err);
      setError("登入失敗，請稍後再試");
      setIsLoading(false);
    }
  };

  return (
    <div>
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
                    cursor: "pointer"
                  }}
                >
                  <FontAwesomeIcon
                    icon={faHouseChimney}
                    className="home-icon"
                  />
                </a>
              </div>

              <h1 className="register-title">後台管理登入</h1>
              <div className="toggle">
                <span className="toggle-active">管理員登入</span>
                <Link href="/user/login" className="toggle-link">
                  會員登入
                </Link>
              </div>
            </div>

            <main>
              <form
                id="admin-login-form"
                autoComplete="on"
                onSubmit={handleSubmit}
              >
                {/* 帳號 */}
                <div className="field">
                  <label htmlFor="username" className="label">
                    管理員帳號
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="input"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="請輸入管理員帳號"
                  />
                </div>

                {/* 密碼 */}
                <div className="field">
                  <label htmlFor="password" className="label">
                    管理員密碼
                  </label>
                  <div className="password-block">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="請輸入管理員密碼"
                    />
                    <FontAwesomeIcon
                      icon={faLock}
                      className="fa-solid fa-lock"
                      style={{ color: '#666', marginRight: '10px' }}
                    />
                  </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                  <div className="error-message" style={{
                    color: '#e74c3c',
                    fontSize: '14px',
                    marginBottom: '15px',
                    textAlign: 'center',
                    backgroundColor: '#fdf2f2',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #fecaca'
                  }}>
                    {error}
                  </div>
                )}

                {/* 登入按鈕 */}
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={isLoading}
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faLock} />
                  &nbsp;{isLoading ? "登入中..." : "登入後台"}
                </button>

                <div className="divider">或</div>

                <div className="d-flex align-items-center justify-content-between">
                  <p className="signin">
                    一般用戶？{" "}
                    <Link href="/user/login" className="link2">
                      前往會員登入
                    </Link>
                  </p>
                </div>
              </form>
            </main>
          </div>
        </div>

        <div className="hidden">
          {/* 背景圖片 */}
          <div className="background-image"></div>

          {/* 隱藏的 SVG 用於遮罩定義 */}
          <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
              <mask id="lottie-mask">
                <rect width="100%" height="100%" fill="black" />
                <g id="mask-content" fill="white" transform="scale(-1,1)"></g>
              </mask>
            </defs>
          </svg>

          {/* 隱藏的 Lottie 動畫 */}
          <div className="lottie-mask" id="lottie-animation"></div>
        </div>
      </div>

      <div className="round"></div>
    </div>
  );
}
