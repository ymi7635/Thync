'use client'
// 【後台】商品管理列表頁（單畫面不捲動，表格內部自行捲動）
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../../styles/admin.css'
import { API_URL } from "@/utils/api"

export default function ProductsAdminPage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)
    const perPage = 10


    const fetchProducts = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                ...(searchTerm && { search: searchTerm })
            })
            const response = await fetch(`${API_URL}/api/admin/products?${queryParams}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error('獲取商品列表失敗')
            const data = await response.json()
            setProducts(data.data)
            setTotalPages(data.pagination.total_pages)
            setTotalProducts(data.pagination.total)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (admin) fetchProducts()
    }, [admin, currentPage])

    const handleToggleValid = async (productId, currentValid) => {
        const action = currentValid ? '下架' : '上架'
        if (!confirm(`確定要${action}此商品嗎？`)) return
        try {
            const response = await fetch(`${API_URL}/api/admin/products/${productId}/toggle-valid`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error(`${action}失敗`)
            fetchProducts()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchProducts()
    }


    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="page-header">
                            <h1 className="page-title">商品管理</h1>
                            <p className="page-description">管理所有商品，包含新增、編輯、上下架</p>
                        </div>

                        <div className="admin-filter-section">
                            <div className="admin-filter-header">
                                <form onSubmit={handleSearch} className="admin-search-container">
                                    <div className="admin-search-input">
                                        <svg className="admin-search-icon" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.75 16.25L12.3855 12.8795M14.25 8.375C14.25 11.8955 11.3955 14.75 7.875 14.75C4.3545 14.75 1.5 11.8955 1.5 8.375C1.5 4.8545 4.3545 2 7.875 2C11.3955 2 14.25 4.8545 14.25 8.375Z" stroke="#94AFCA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="搜尋商品名稱..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </form>
                                <div className="admin-filter-actions">
                                    <button className="admin-btn-apply" onClick={handleSearch}>搜尋</button>
                                </div>
                            </div>

                            <div className="admin-stats-actions">
                                <div className="admin-stats-group">
                                    <div className="admin-stat-item">
                                        <span className="admin-stat-value">{totalProducts}</span>
                                        <span className="admin-stat-label">總商品數</span>
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
                                    <Link href="/admin/products/create" className="admin-btn-primary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        新增商品
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="admin-loading">
                                <div className="loading-spinner"></div>
                                <p>載入商品中...</p>
                            </div>
                        ) : error ? (
                            <div className="admin-error">
                                <p>錯誤：{error}</p>
                                <button onClick={fetchProducts} className="admin-btn-secondary">重新載入</button>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>圖片</th>
                                            <th>名稱</th>
                                            <th>分類</th>
                                            <th>品牌</th>
                                            <th>價格</th>
                                            <th>狀態</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="admin-table-row">
                                                <td className="article-id">{product.id}</td>
                                                <td className="article-cover">
                                                    <div className="cover-thumbnail">
                                                        <img
                                                            src={product.first_image ? `/images/products/uploads/${product.first_image}` : '/images/no-image.jpg'}
                                                            alt={product.name}
                                                            onError={(e) => { e.target.src = '/images/no-image.jpg' }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="article-title">
                                                    <div className="title-content">
                                                        <h3>{product.name}</h3>
                                                    </div>
                                                </td>
                                                <td className="article-category">
                                                    <span className="category-badge">{product.category_sub_name}</span>
                                                </td>
                                                <td>{product.brand_name || '—'}</td>
                                                <td>NT$ {Number(product.price).toLocaleString()}</td>
                                                <td>
                                                    <span className="category-badge" style={{
                                                        backgroundColor: product.is_valid ? '#e6f7ee' : '#fdf2f2',
                                                        color: product.is_valid ? '#1a9c5b' : '#DC3545'
                                                    }}>
                                                        {product.is_valid ? '上架中' : '已下架'}
                                                    </span>
                                                </td>
                                                <td className="article-actions">
                                                    <div className="action-buttons">
                                                        <Link
                                                            href={`/admin/products/edit/${product.id}`}
                                                            className="admin-btn-icon edit-btn"
                                                            title="編輯商品"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleToggleValid(product.id, product.is_valid)}
                                                            className="admin-btn-icon delete-btn"
                                                            title={product.is_valid ? '下架' : '上架'}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                {product.is_valid ? (
                                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                ) : (
                                                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                )}
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                                <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>›</button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    )
}
