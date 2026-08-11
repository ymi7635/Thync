'use client'
// 【後台】訂單管理列表頁（單畫面不捲動，表格內部自行捲動）
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../../styles/admin.css'
import { API_URL } from "@/utils/api"

const STATUS_LABEL = {
    pending: { text: '待付款', bg: '#fff8e1', color: '#b8860b' },
    paid: { text: '已付款', bg: '#e6f7ee', color: '#1a9c5b' },
    failed: { text: '失敗', bg: '#fdf2f2', color: '#DC3545' },
}

export default function OrdersAdminPage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const perPage = 10


    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
        })
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter }),
            })
            const response = await fetch(`${API_URL}/api/admin/orders?${queryParams}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error('獲取訂單列表失敗')
            const data = await response.json()
            setOrders(data.data)
            setTotalPages(data.pagination.total_pages)
            setTotalOrders(data.pagination.total)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (admin) fetchOrders()
    }, [admin, currentPage, statusFilter])

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ status_now: newStatus }),
            })
            if (!response.ok) throw new Error('更新訂單狀態失敗')
            fetchOrders()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchOrders()
    }


    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="page-header">
                            <h1 className="page-title">訂單管理</h1>
                            <p className="page-description">查看訂單明細、更新訂單狀態</p>
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
                                            placeholder="搜尋訂單編號、會員姓名、信箱..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </form>
                                <div className="admin-filter-actions">
                                    <select
                                        className="admin-sort-select"
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                                    >
                                        <option value="">全部狀態</option>
                                        <option value="pending">待付款</option>
                                        <option value="paid">已付款</option>
                                        <option value="failed">失敗</option>
                                    </select>
                                    <button className="admin-btn-apply" onClick={handleSearch}>搜尋</button>
                                </div>
                            </div>
                            <div className="admin-stats-actions">
                                <div className="admin-stats-group">
                                    <div className="admin-stat-item">
                                        <span className="admin-stat-value">{totalOrders}</span>
                                        <span className="admin-stat-label">總訂單數</span>
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
                            </div>
                        </div>

                        {loading ? (
                            <div className="admin-loading">
                                <div className="loading-spinner"></div>
                                <p>載入訂單中...</p>
                            </div>
                        ) : error ? (
                            <div className="admin-error">
                                <p>錯誤：{error}</p>
                                <button onClick={fetchOrders} className="admin-btn-secondary">重新載入</button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="empty-trash">
                                <div className="empty-trash-icon">📦</div>
                                <h3>目前沒有訂單</h3>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>訂單編號</th>
                                            <th>會員</th>
                                            <th>付款方式</th>
                                            <th>應付金額</th>
                                            <th>下單時間</th>
                                            <th>狀態</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const s = STATUS_LABEL[order.status_now] || { text: order.status_now, bg: '#eee', color: '#666' }
                                            return (
                                                <tr key={order.id} className="admin-table-row">
                                                    <td>{order.numerical_order}</td>
                                                    <td>
                                                        <div>{order.user_name || '—'}</div>
                                                        <div style={{ fontSize: '12px', color: '#888' }}>{order.user_mail}</div>
                                                    </td>
                                                    <td>{order.pay_method}</td>
                                                    <td>NT$ {Number(order.final_amount).toLocaleString()}</td>
                                                    <td>{formatDate(order.order_date)}</td>
                                                    <td>
                                                        <span className="category-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                                                            {s.text}
                                                        </span>
                                                    </td>
                                                    <td className="article-actions">
                                                        <select
                                                            className="admin-sort-select"
                                                            value={order.status_now}
                                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        >
                                                            <option value="pending">待付款</option>
                                                            <option value="paid">已付款</option>
                                                            <option value="failed">失敗</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            )
                                        })}
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
