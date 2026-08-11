"use client";
// 文章卡片元件：文章列表頁用來顯示單篇文章的縮圖、標題、日期
import Link from 'next/link'

export default function ArticleCard({ article }) {
    // 格式化日期
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    }

    // 如果沒有傳入文章資料，使用預設資料
    if (!article) {
        return (
            <div>
                <img src="/images/articleSample.jpg" alt="Article Image" className="image" />
                <div className="content">
                    <div className="note">
                        <p className="time">2024-05-01</p>
                        <button className="btn ">機械鍵盤</button>
                    </div>
                    <h5 className="title">鍵帽的神 GMK 開箱評測</h5>
                    <p className="description">本篇將帶你了解各種機械鍵盤軸體、配列與選購重點，幫助你
                        找到最適合自己的鍵盤！從青軸到茶軸，從60%到全尺寸，一
                        次搞懂所有選擇。</p>
                    <div className="footer">
                        <div className="admin">
                            <img src="/images/admin.jpg" alt="admin-image" className="avatar" />
                            <p className="name">財神爺小編</p>
                        </div>
                        <Link href="#" className="btn ">閱讀更多</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Link href={`/articles/${article.id}`} className="article-card-link">
            <div>
                <img 
                    src={article.cover_image ? `/images/articles/${article.cover_image}` : '/images/articleSample.jpg'} 
                    alt={article.title} 
                    className="image"
                    onError={(e) => {
                        e.target.src = '/images/articleSample.jpg'
                    }}
                />
                <div className="content">
                    <div className="note">
                        <p className="time">{formatDate(article.created_at)}</p>
                        <button className="btn " onClick={(e) => e.preventDefault()}>{article.category_name || '未分類'}</button>
                    </div>
                    <h5 className="title">{article.title}</h5>
                    <p className="description">
                        {article.content ? 
                            article.content.substring(0, 150) + '...' : 
                            '暫無內容'
                        }
                    </p>
                    <div className="footer">
                        <div className="admin">
                            <img src="/images/admin.jpg" alt="admin-image" className="avatar" />
                            <p className="name">財神爺小編</p>
                        </div>
                        <span className="btn ">閱讀更多</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}