"use client";
// 前台文章詳情頁
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../_components/header";
import Footer from "../../_components/footer";
import RelatedArticles from "../../_components/articles/RelatedArticles";
import "../../../styles/article-detail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faHeartCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/use-auth";
import { API_URL } from "@/utils/api";

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false); // 收藏狀態

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 獲取文章資料
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/articles/${params.id}`
        );
        if (!response.ok) {
          throw new Error("文章不存在");
        }
        const data = await response.json();
        setArticle(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  // 檢查收藏狀態
  useEffect(() => {
    async function checkWishlistStatus() {
      if (!user || !article?.id) return;

      try {
        const token = localStorage.getItem("reactLoginToken");
        if (!token) return;
        const res = await fetch(
          `${API_URL}/api/users/favorites-status/${article.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(result.isWishlisted);
        }
      } catch (error) {
        console.error("檢查收藏狀態錯誤:", error);
      }
    }

    checkWishlistStatus();
  }, [user, article?.id]);

  // 切換收藏狀態
  async function handleToggleWishlist() {
    if (!user) {
      alert("請先登入");
      return;
    }

    try {
      const token = localStorage.getItem("reactLoginToken");

      if (isWishlisted) {
        // 移除收藏
        const res = await fetch(
          `${API_URL}/api/users/favorites/${article.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(false);
        } else {
          alert(result.message || "移除收藏失敗");
        }
      } else {
        // 加入收藏
        const res = await fetch(
          `${API_URL}/api/users/add-favorites`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ articleId: article.id }),
          }
        );
        const result = await res.json();

        if (result.status === "success") {
          setIsWishlisted(true);
        } else {
          alert(result.message || "加入收藏失敗");
        }
      }
    } catch (error) {
      console.error("收藏操作錯誤:", error);
      alert("操作失敗，請稍後再試");
    }
  }

  // 載入狀態
  if (loading) {
    return (
      <div className="article-page">
        <div className="container header">
          <Header />
        </div>
        <main className="main-content">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>載入文章中...</p>
            </div>
          </div>
        </main>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }

  // 錯誤狀態
  if (error || !article) {
    return (
      <div className="article-page">
        <Header />
        <div className="container header"></div>
        <main className="main-content error">
          <div className="container">
            <div className="error-container">
              <h3>😔 文章載入失敗</h3>
              <p>{error || "找不到指定的文章"}</p>
              <button onClick={() => window.history.back()}>返回上一頁</button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="article-page">
      <Header />
      <main className="main-content">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <svg
              className="breadcrumb-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.8173 2.7225C12.356 2.295 11.6435 2.295 11.186 2.7225L2.78602 10.5225C2.42602 10.86 2.30602 11.3812 2.48602 11.8387C2.66602 12.2962 3.10477 12.6 3.59977 12.6H4.19977V19.2C4.19977 20.5237 5.27602 21.6 6.59977 21.6H17.3998C18.7235 21.6 19.7998 20.5237 19.7998 19.2V12.6H20.3998C20.8948 12.6 21.3373 12.2962 21.5173 11.8387C21.6973 11.3812 21.5773 10.8562 21.2173 10.5225L12.8173 2.7225ZM11.3998 14.4H12.5998C13.5935 14.4 14.3998 15.2062 14.3998 16.2V19.8H9.59977V16.2C9.59977 15.2062 10.406 14.4 11.3998 14.4Z" />
            </svg>
            <span className="breadcrumb-text">首頁</span>
            <svg
              className="breadcrumb-arrow"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.45455 8.62285L2.33204 15.7417C1.98763 16.0861 1.43073 16.0861 1.08999 15.7417L0.258301 14.91C-0.0861003 14.5656 -0.0861003 14.0124 0.258301 13.668L5.90062 8L0.258301 2.33204C-0.0824365 1.98763 -0.0824365 1.43439 0.258301 1.08999L1.08999 0.258301C1.43439 -0.0861003 1.9913 -0.0861003 2.33204 0.258301L9.45455 7.37715C9.79895 7.72155 9.79895 8.27845 9.45455 8.61919V8.62285Z" />
            </svg>
            <span className="breadcrumb-text">文章分享</span>
            <svg
              className="breadcrumb-arrow"
              viewBox="0 0 10 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.45455 8.62285L2.33204 15.7417C1.98763 16.0861 1.43073 16.0861 1.08999 15.7417L0.258301 14.91C-0.0861003 14.5656 -0.0861003 14.0124 0.258301 13.668L5.90062 8L0.258301 2.33204C-0.0824365 1.98763 -0.0824365 1.43439 0.258301 1.08999L1.08999 0.258301C1.43439 -0.0861003 1.9913 -0.0861003 2.33204 0.258301L9.45455 7.37715C9.79895 7.72155 9.79895 8.27845 9.45455 8.61919V8.62285Z" />
            </svg>
            <span className="breadcrumb-text">{article.title}</span>
          </nav>

          {/* Article Section */}
          <div className="article-section">
            {/* Hero Section */}
            <div className="article-hero">
              {/* Featured Image */}
              {article.cover_image && (
                <div className="hero-image">
                  <img
                    src={
                      article.cover_image
                        ? `/images/articles/${article.cover_image}`
                        : "/images/articleSample.jpg"
                    }
                    alt={article.title}
                    loading="eager"
                    decoding="async"
                    style={{
                      imageRendering: "high-quality",
                      backfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                    }}
                    onError={(e) => {
                      e.target.src = "/images/articleSample.jpg";
                    }}
                    onLoad={(e) => {
                      e.target.style.opacity = "1";
                    }}
                  />
                  <div className="hero-overlay">
                    <div className="hero-content">
                      <div className="hero-meta">
                        <span className="hero-category">
                          {article.category_name || "未分類"}
                        </span>
                        <span className="hero-date">
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                      <h1 className="hero-title">{article.title}</h1>
                      <div className="hero-stats">
                        <div className="stat-badge">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 17"
                            fill="none"
                          >
                            <path
                              d="M8.00065 1.52335C4.32065 1.52335 1.33398 4.51001 1.33398 8.19001C1.33398 11.87 4.32065 14.8567 8.00065 14.8567C11.6807 14.8567 14.6673 11.87 14.6673 8.19001C14.6673 4.51001 11.6807 1.52335 8.00065 1.52335ZM8.00065 13.5233C5.06065 13.5233 2.66732 11.13 2.66732 8.19001C2.66732 5.25001 5.06065 2.85668 8.00065 2.85668C10.9407 2.85668 13.334 5.25001 13.334 8.19001C13.334 11.13 10.9407 13.5233 8.00065 13.5233Z"
                              fill="white"
                            />
                            <path
                              d="M8.33398 4.85666H7.33398V8.85666L10.834 10.9567L11.334 10.1367L8.33398 8.35666V4.85666Z"
                              fill="white"
                            />
                          </svg>
                          <span>約 8 分鐘閱讀</span>
                        </div>
                        <div className="stat-badge">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                              fill="white"
                            />
                          </svg>
                          <span>{article.views || 0} 次閱讀</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback Header for articles without cover image */}
              {!article.cover_image && (
                <div className="article-header-fallback">
                  <div className="header-content">
                    <div className="article-meta-row">
                      <span className="article-category-badge">
                        {article.category_name || "未分類"}
                      </span>
                      <span className="article-date-text">
                        {formatDate(article.created_at)}
                      </span>
                    </div>
                    <h1 className="article-main-title">{article.title}</h1>
                    <div className="article-stats-row">
                      <div className="stat-item-inline">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 17"
                          fill="none"
                        >
                          <path
                            d="M8.00065 1.52335C4.32065 1.52335 1.33398 4.51001 1.33398 8.19001C1.33398 11.87 4.32065 14.8567 8.00065 14.8567C11.6807 14.8567 14.6673 11.87 14.6673 8.19001C14.6673 4.51001 11.6807 1.52335 8.00065 1.52335ZM8.00065 13.5233C5.06065 13.5233 2.66732 11.13 2.66732 8.19001C2.66732 5.25001 5.06065 2.85668 8.00065 2.85668C10.9407 2.85668 13.334 5.25001 13.334 8.19001C13.334 11.13 10.9407 13.5233 8.00065 13.5233Z"
                            fill="#6B6A67"
                          />
                          <path
                            d="M8.33398 4.85666H7.33398V8.85666L10.834 10.9567L11.334 10.1367L8.33398 8.35666V4.85666Z"
                            fill="#6B6A67"
                          />
                        </svg>
                        <span>約 8 分鐘閱讀</span>
                      </div>
                      <div className="stat-item-inline">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                            fill="#6B6A67"
                          />
                        </svg>
                        <span>{article.views || 0} 次閱讀</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Article Content Container */}
            <article className="article-main">
              {/* Author Section */}
              <div className="author-banner">
                <div className="author-info-enhanced">
                  <img
                    src="/images/admin.jpg"
                    alt="Author"
                    className="author-avatar-large"
                  />
                  <div className="author-details-enhanced">
                    <span className="author-name-large">財神爺小編</span>
                    <span className="author-title">科技編輯</span>
                    <span className="publish-info">
                      發布於 {formatDate(article.created_at)}
                    </span>
                  </div>
                </div>
                <div className="article-actions-preview">
                  <button
                    onClick={handleToggleWishlist}
                    className={`btn ${
                      isWishlisted ? "btn-follow" : "btn-unfollow"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isWishlisted ? faHeart : faHeartCirclePlus}
                    />
                    {isWishlisted ? "　已收藏" : "　收藏"}
                  </button>
                  <button className="action-btn-preview share-preview">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>分享</span>
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div className="article-content-enhanced">
                {/* Article Body */}
                <div className="article-body">
                  <div className="content-wrapper">
                    <pre
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                </div>

                {/* Article Meta Footer */}
                <div className="article-meta-footer">
                  {/* Tags Section */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="tags-section">
                      <div className="tags-container">
                        {article.tags.map((tag, index) => (
                          <span key={index} className="tag-enhanced">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M9.293 1.293A1 1 0 0 1 10 1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-.293.707l-8 8a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l8-8z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <circle
                                cx="13.5"
                                cy="4.5"
                                r="1.5"
                                fill="currentColor"
                              />
                            </svg>
                            {tag.name || tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement Actions */}
                </div>
              </div>

              {/* Bottom gradient */}
              <div className="bottom-gradient"></div>
            </article>

            {/* Related Articles Section */}
            <section className="related-section">
              <div className="related-header">
                <h2 className="related-title">相關文章推薦</h2>
                <p className="related-subtitle">發現更多精彩內容</p>
              </div>

              <div className="related-articles">
                <RelatedArticles currentArticleId={params.id} limit={3} />
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      {/* Scroll to top button */}
      <div
        className="scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg
          width="44"
          height="50"
          viewBox="0 0 44 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_334_546)">
            <path
              d="M6.25 7.8125C5.39062 7.8125 4.6875 8.51562 4.6875 9.375V40.625C4.6875 41.4844 5.39062 42.1875 6.25 42.1875H37.5C38.3594 42.1875 39.0625 41.4844 39.0625 40.625V9.375C39.0625 8.51562 38.3594 7.8125 37.5 7.8125H6.25ZM0 9.375C0 5.92773 2.80273 3.125 6.25 3.125H37.5C40.9473 3.125 43.75 5.92773 43.75 9.375V40.625C43.75 44.0723 40.9473 46.875 37.5 46.875H6.25C2.80273 46.875 0 44.0723 0 40.625V9.375ZM21.875 15.625C22.5293 15.625 23.1445 15.8984 23.5938 16.377L33.75 27.3145C34.3848 27.998 34.5508 28.9941 34.1797 29.8438C33.8086 30.6934 32.959 31.25 32.0312 31.25H11.7188C10.791 31.25 9.94141 30.6934 9.57031 29.8438C9.19922 28.9941 9.36523 27.998 10 27.3145L20.1562 16.377C20.5957 15.8984 21.2207 15.625 21.875 15.625Z"
              fill="#304A6F"
            />
          </g>
          <defs>
            <clipPath id="clip0_334_546">
              <rect width="43.75" height="50" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}
