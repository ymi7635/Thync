"use client";
// 驗證碼輸入頁（忘記密碼流程的一部分）

import { useAuth } from "@/hooks/use-auth";
import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import styles from "@/styles/verification-code.css";
import "@/styles/loader.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "@/utils/api";

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="loader"></div>}>
      <VerificationPageInner />
    </Suspense>
  );
}

function VerificationPageInner() {
  const searchParams = useSearchParams();
  const mailFromQuery = searchParams.get("mail") || "";
  const [mail, setMail] = useState(mailFromQuery);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    if (lottieLoaded || window.lottie) {
      initializeLottie();
    }
  }, [lottieLoaded]);

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

  // 重新發送驗證碼

  const handleResendCode = async (e) => {
    e.preventDefault();

    if (!mail) {
      setMessage("請輸入信箱");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mail }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("驗證碼已再次發送至您的信箱");
        setMessageType("success");
        setVerificationCode(""); // 清空舊的驗證碼
      } else {
        setMessage(data.message || "重新發送失敗");
        setMessageType("error");
      }
    } catch (error) {
      console.error("重新發送驗證碼錯誤:", error);
      setMessage("網路錯誤，請稍後再試");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // 重設密碼

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!mail || !verificationCode || !password) {
      setMessage("請填寫所有欄位");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("兩次密碼輸入不一致");
      setMessageType("error");

      return;
    }

    if (password.length < 6) {
      setMessage("密碼至少需要6個字元");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/users/verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail,
            verificationCode,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("重設密碼成功！即將跳轉回登入頁面...");
        setMessageType("success");
        // 3秒後跳轉到登入頁面
        setTimeout(() => {
          window.location.href = "/user/login";
        }, 1000);
      } else {
        setMessage(data.message || "密碼重設失敗");
        setMessageType("error");
      }
    } catch (error) {
      console.error("重設密碼錯誤:", error);
      setMessage("網路錯誤，請稍後再試");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="loader"></div>;
  }

  return (
    <div>
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
              <img src="/images/LOGO.png" alt="" />
              <h1 className="register-title">忘記密碼</h1>
              <div className="toggle">
                <a
                  className="toggle-link"
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
              <form id="login-form" autoComplete="on">
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
                    disabled={isLoading}
                  />
                </div>

                {/* 驗證碼 */}
                <div className="field">
                  <label htmlFor="verification-code" className="label">
                    驗證碼
                  </label>
                  <input
                    id="verification-code"
                    name="verificationCode"
                    type="text"
                    placeholder="請輸入6位數驗證碼"
                    className="input"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength="6"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* 新密碼 */}
                <div className="field">
                  <label htmlFor="password" className="label">
                    新密碼
                  </label>
                  <div className="password-block">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="input"
                      placeholder="請輸入新密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
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

                {/* 確認密碼 */}
                <div className="field">
                  <label htmlFor="confirm-password" className="label">
                    確認密碼
                  </label>
                  <div className="password-block">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showPassword ? "text" : "password"}
                      className="input"
                      placeholder="請再次輸入新密碼"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
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

                {/* 訊息顯示 */}
                {message && (
                  <div className={`message ${messageType}`}>{message}</div>
                )}

                {/* 按鈕 */}
                <div className="d-flex gap-3 align-items-center">
                  <button
                    className="btn-primary"
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        &nbsp;&nbsp;發送中...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-envelope"></i>
                        &nbsp;&nbsp;重新發送驗證碼
                      </>
                    )}
                  </button>

                  <button
                    className="btn-primary"
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        &nbsp;&nbsp;處理中...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-key"></i>
                        &nbsp;&nbsp;重設密碼
                      </>
                    )}
                  </button>
                </div>

                <div className="divider">或</div>

                <p className="signin">
                  <a href="/user/login" className="link2">
                    <FontAwesomeIcon icon={faRightToBracket} className="me-1" />
                    返回登入
                  </a>
                </p>
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
    </div>
  );
}
