'use client'
// 【後台】文章管理列表頁
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../../styles/admin.css'
import { API_URL } from "@/utils/api";

export default function ArticlesAdminPage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()

    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalArticles, setTotalArticles] = useState(0)
    const perPage = 10

    // 權限檢查已暫時移除用於測試
    // useEffect(() => {
    //     if (!isLoading && (!user || user.role !== 'admin')) {
    //         router.replace("/user/login")
    //     }
    // }, [user, isLoading, router])

    // 格式化日期
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // 獲取文章列表
    const fetchArticles = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                sort: sortBy,
                order: sortOrder,
                ...(searchTerm && { search: searchTerm })
            })

            const response = await fetch(`${API_URL}/api/articles?${queryParams}`)
            if (!response.ok) {
                throw new Error('獲取文章列表失敗')
            }
            
            const data = await response.json()
            setArticles(data.data.articles)
            setTotalPages(data.data.pagination.total_pages)
            setTotalArticles(data.data.pagination.total)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // 軟刪除文章
    const handleSoftDelete = async (articleId) => {
        if (!confirm('確定要將此文章移至垃圾桶嗎？')) return

        try {
            const response = await fetch(`${API_URL}/api/articles/${articleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ is_deleted: 1 })
            })

            if (!response.ok) {
                throw new Error('刪除失敗')
            }

            // 重新獲取文章列表
            fetchArticles()
            alert('文章已移至垃圾桶')
        } catch (err) {
            alert('刪除失敗：' + err.message)
        }
    }

    // 搜尋處理
    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchArticles()
    }

    // 排序處理
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
        setCurrentPage(1)
    }

    useEffect(() => {
        // 移除權限檢查，直接載入文章
        fetchArticles()
    }, [currentPage, sortBy, sortOrder])


    return (
        <>
            
            <div className="admin-page">
                <main className="admin-main">
                <div className="admin-container">
                    {/* 頁面標題區域 - 參考前台風格 */}
                    <div className="page-header">
                        <h1 className="page-title">文章管理</h1>
                        <p className="page-description">管理和編輯所有文章內容，讓您的內容更加出色</p>
                    </div>

                    {/* 篩選區域 - 參考前台設計 */}
                    <div className="admin-filter-section">
                        {/* 搜尋和操作區域 */}
                        <div className="admin-filter-header">
                            <form onSubmit={handleSearch} className="admin-search-container">
                                <div className="admin-search-input">
                                    <svg className="admin-search-icon" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.75 16.25L12.3855 12.8795M14.25 8.375C14.25 11.8955 11.3955 14.75 7.875 14.75C4.3545 14.75 1.5 11.8955 1.5 8.375C1.5 4.8545 4.3545 2 7.875 2C11.3955 2 14.25 4.8545 14.25 8.375Z" stroke="#94AFCA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="搜尋文章標題、內容..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </form>
                            
                            <div className="admin-filter-actions">
                                <div className="admin-sort-group">
                                    <svg className="admin-sort-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" stroke="currentColor" strokeWidth="2" fill="none"/>
                                    </svg>
                                    <select 
                                        value={`${sortBy}_${sortOrder}`}
                                        onChange={(e) => {
                                            const [column, order] = e.target.value.split('_')
                                            setSortBy(column)
                                            setSortOrder(order)
                                            setCurrentPage(1)
                                        }}
                                        className="admin-sort-select"
                                    >
                                        <option value="created_at_desc">最新建立</option>
                                        <option value="created_at_asc">最早建立</option>
                                        <option value="updated_at_desc">最近更新</option>
                                        <option value="updated_at_asc">最早更新</option>
                                        <option value="title_asc">標題 A-Z</option>
                                        <option value="title_desc">標題 Z-A</option>
                                        <option value="views_desc">瀏覽量高</option>
                                        <option value="views_asc">瀏覽量低</option>
                                    </select>
                                </div>
                                
                                <button className="admin-btn-clear" onClick={() => {
                                    setSearchTerm('')
                                    setSortBy('created_at')
                                    setSortOrder('desc')
                                    setCurrentPage(1)
                                    fetchArticles()
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" fill="currentColor"/>
                                    </svg>
                                    清除篩選
                                </button>
                                
                                <button className="admin-btn-apply" onClick={handleSearch}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/>
                                    </svg>
                                    套用篩選
                                </button>
                            </div>
                        </div>

                        {/* 統計和操作區域 */}
                        <div className="admin-stats-actions">
                            <div className="admin-stats-group">
                                <div className="admin-stat-item">
                                    <span className="admin-stat-value">{totalArticles}</span>
                                    <span className="admin-stat-label">總文章</span>
                                </div>
                                <div className="admin-stat-item">
                                    <span className="admin-stat-value">{currentPage}</span>
                                    <span className="admin-stat-label">當前頁</span>
                                </div>
                                <div className="admin-stat-item">
                                    <span className="admin-stat-value">{totalPages}</span>
                                    <span className="admin-stat-label">總頁數</span>
                                </div>
                            </div>
                            
                            <div className="admin-action-group">
                                <Link href="/admin/articles/create" className="admin-btn-primary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    新增文章
                                </Link>
                                <Link href="/admin/articles/trash" className="admin-btn-secondary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    垃圾桶
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 文章列表 */}
                    {loading ? (
                        <div className="admin-loading">
                            <div className="loading-spinner"></div>
                            <p>載入文章中...</p>
                        </div>
                    ) : error ? (
                        <div className="admin-error">
                            <p>錯誤：{error}</p>
                            <button onClick={fetchArticles} className="admin-btn-secondary">重新載入</button>
                        </div>
                    ) : (
                        <>
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort('id')} className="sortable">
                                                ID {sortBy === 'id' && (sortOrder === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th>封面</th>
                                            <th onClick={() => handleSort('title')} className="sortable">
                                                標題 {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th>分類</th>
                                            <th onClick={() => handleSort('views')} className="sortable">
                                                瀏覽量 {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th onClick={() => handleSort('created_at')} className="sortable">
                                                建立時間 {sortBy === 'created_at' && (sortOrder === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articles.map((article) => (
                                            <tr key={article.id} className="admin-table-row">
                                                <td className="article-id">{article.id}</td>
                                                <td className="article-cover">
                                                    <div className="cover-thumbnail">
                                                        <img 
                                                            src={article.cover_image ? `/images/articles/${article.cover_image}` : '/images/articleSample.jpg'} 
                                                            alt={article.title}
                                                            onError={(e) => {
                                                                e.target.src = '/images/articleSample.jpg'
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="article-title">
                                                    <div className="title-content">
                                                        <h3>{article.title}</h3>
                                                        <p className="article-excerpt">
                                                            {article.content ? 
                                                                article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                                                                : '無內容預覽'
                                                            }
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="article-category">
                                                    <span className="category-badge">
                                                        {article.category_name || '未分類'}
                                                    </span>
                                                </td>
                                                <td className="article-views">
                                                    <div className="views-badge">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                                        </svg>
                                                        {article.views || 0}
                                                    </div>
                                                </td>
                                                <td className="article-date">
                                                    <div className="date-info">
                                                        <div className="created-date">{formatDate(article.created_at)}</div>
                                                        {article.updated_at !== article.created_at && (
                                                            <div className="updated-date">更新: {formatDate(article.updated_at)}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="article-actions">
                                                    <div className="action-buttons">
                                                        <Link 
                                                            href={`/articles/${article.id}`} 
                                                            className="admin-btn-icon view-btn"
                                                            title="查看文章"
                                                            target="_blank"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                                            </svg>
                                                        </Link>
                                                        <Link 
                                                            href={`/admin/articles/edit/${article.id}`} 
                                                            className="admin-btn-icon edit-btn"
                                                            title="編輯文章"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleSoftDelete(article.id)}
                                                            className="admin-btn-icon delete-btn"
                                                            title="移至垃圾桶"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                            {/* 分頁控制 */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="page-btn"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.1602 7.41L10.5802 12L15.1602 16.59L13.7502 18L7.75016 12L13.7502 6L15.1602 7.41Z" fill="#101C35" />
                                        </svg>
                                    </button>

                                    {(() => {
                                        const pages = []
                                        const totalPagesNum = totalPages

                                        if (totalPagesNum <= 5) {
                                            // 如果總頁數 <= 5，顯示所有頁碼
                                            for (let i = 1; i <= totalPagesNum; i++) {
                                                pages.push(i)
                                            }
                                        } else {
                                            // 如果總頁數 > 5，智能顯示頁碼
                                            if (currentPage <= 3) {
                                                // 當前頁在前面，顯示 1, 2, 3, 4, 5
                                                pages.push(1, 2, 3, 4, 5)
                                            } else if (currentPage >= totalPagesNum - 2) {
                                                // 當前頁在後面，顯示最後 5 頁
                                                for (let i = totalPagesNum - 4; i <= totalPagesNum; i++) {
                                                    pages.push(i)
                                                }
                                            } else {
                                                // 當前頁在中間，顯示前後各 2 頁
                                                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                                                    pages.push(i)
                                                }
                                            }
                                        }

                                        return pages.map(pageNum => (
                                            <button
                                                key={pageNum}
                                                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        ))
                                    })()}

                                    <button
                                        className="page-btn"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.83984 7.41L13.4198 12L8.83984 16.59L10.2498 18L16.2498 12L10.2498 6L8.83984 7.41Z" fill="#101C35" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                </div>
                </main>
            </div>
            
        </>
    )
}
