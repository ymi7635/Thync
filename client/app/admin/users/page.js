'use client'
// 【後台】會員管理列表頁（啟用/停權）
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import '../../../styles/admin.css'
import { API_URL } from "@/utils/api"

export default function UsersAdminPage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    const perPage = 15


    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                ...(searchTerm && { search: searchTerm }),
            })
            const response = await fetch(`${API_URL}/api/admin/users?${queryParams}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error('獲取會員列表失敗')
            const data = await response.json()
            setUsers(data.data)
            setTotalPages(data.pagination.total_pages)
            setTotalUsers(data.pagination.total)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (admin) fetchUsers()
    }, [admin, currentPage])

    const handleToggleValid = async (userId, currentValid) => {
        const action = currentValid ? '停權' : '啟用'
        if (!confirm(`確定要${action}此會員嗎？`)) return
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-valid`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error(`${action}失敗`)
            fetchUsers()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchUsers()
    }


    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="page-header">
                            <h1 className="page-title">會員管理</h1>
                            <p className="page-description">查看會員列表，啟用或停權帳號</p>
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
                                            placeholder="搜尋姓名、信箱、帳號..."
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
                                        <span className="admin-stat-value">{totalUsers}</span>
                                        <span className="admin-stat-label">總會員數</span>
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
                                <p>載入會員中...</p>
                            </div>
                        ) : error ? (
                            <div className="admin-error">
                                <p>錯誤：{error}</p>
                                <button onClick={fetchUsers} className="admin-btn-secondary">重新載入</button>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>姓名</th>
                                            <th>帳號</th>
                                            <th>信箱</th>
                                            <th>電話</th>
                                            <th>註冊日期</th>
                                            <th>狀態</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="admin-table-row">
                                                <td className="article-id">{u.id}</td>
                                                <td>{u.name || '—'}</td>
                                                <td>{u.account}</td>
                                                <td>{u.mail}</td>
                                                <td>{u.phone || '—'}</td>
                                                <td>{formatDate(u.create_at)}</td>
                                                <td>
                                                    <span className="category-badge" style={{
                                                        backgroundColor: u.is_valid ? '#e6f7ee' : '#fdf2f2',
                                                        color: u.is_valid ? '#1a9c5b' : '#DC3545'
                                                    }}>
                                                        {u.is_valid ? '正常' : '已停權'}
                                                    </span>
                                                </td>
                                                <td className="article-actions">
                                                    <button
                                                        onClick={() => handleToggleValid(u.id, u.is_valid)}
                                                        className="admin-btn-secondary"
                                                        style={u.is_valid ? { color: '#DC3545', borderColor: '#DC3545' } : { color: '#1a9c5b', borderColor: '#1a9c5b' }}
                                                    >
                                                        {u.is_valid ? '停權' : '啟用'}
                                                    </button>
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
