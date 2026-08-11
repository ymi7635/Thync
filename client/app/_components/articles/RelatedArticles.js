'use client'
// 文章詳情頁的「相關文章」推薦區塊
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { API_URL } from "@/utils/api";

export default function RelatedArticles({ currentArticleId, limit = 3 }) {
    const [relatedArticles, setRelatedArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // 格式化日期
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    // 截取文章內容
    const truncateContent = (content, maxLength = 100) => {
        if (!content) return '暫無描述'
        const textContent = content.replace(/<[^>]*>/g, '') // 移除HTML標籤
        return textContent.length > maxLength 
            ? textContent.substring(0, maxLength) + '...' 
            : textContent
    }

    // 獲取相關文章
    useEffect(() => {
        const fetchRelatedArticles = async () => {
            if (!currentArticleId) return

            try {
                setLoading(true)
                const response = await fetch(
                    `${API_URL}/api/articles/${currentArticleId}/related?limit=${limit}`
                )
                
                if (!response.ok) {
                    throw new Error('無法獲取相關文章')
                }
                
                const data = await response.json()
                setRelatedArticles(data.data || [])
            } catch (err) {
                setError(err.message)
                console.error('獲取相關文章錯誤:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedArticles()
    }, [currentArticleId, limit])

    // 載入狀態
    if (loading) {
        return (
            <>
                {[...Array(limit)].map((_, index) => (
                    <div key={index} className="related-article skeleton">
                        <div className="related-image skeleton-image"></div>
                        <div className="related-content">
                            <div className="skeleton-text skeleton-meta"></div>
                            <div className="skeleton-text skeleton-title"></div>
                            <div className="skeleton-text skeleton-description"></div>
                        </div>
                    </div>
                ))}
            </>
        )
    }

    // 錯誤狀態
    if (error) {
        return (
            <div className="error-message">
                <p>無法載入相關文章推薦</p>
            </div>
        )
    }

    // 沒有相關文章
    if (relatedArticles.length === 0) {
        return null
    }

    return (
        <>
            {relatedArticles.map((article) => (
                <Link 
                    key={article.id} 
                    href={`/articles/${article.id}`}
                    className="related-article-link"
                >
                    <article className="related-article">
                        <div className="related-image-container">
                            <img 
                                src={article.cover_image 
                                    ? `/images/articles/${article.cover_image}` 
                                    : '/images/articleSample.jpg'
                                } 
                                alt={article.title} 
                                className="related-image"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                    e.target.src = '/images/articleSample.jpg'
                                }}
                            />
                            <div className="related-overlay">
                                <svg className="read-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                        </div>
                        
                        <div className="related-content">
                            <div className="related-meta">
                                <span className="related-date">{formatDate(article.created_at)}</span>
                                <div className="related-category">
                                    <span className="related-category-text">
                                        {article.category_name || '未分類'}
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="related-article-title">{article.title}</h3>
                            
                            <p className="related-description">
                                {truncateContent(article.content)}
                            </p>
                            
                            <div className="related-stats">
                                <div className="stat-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    <span>{article.views || 0}</span>
                                </div>
                            </div>
                        </div>
                    </article>
                </Link>
            ))}
        </>
    )
}
