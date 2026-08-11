'use client'
// 【後台】優惠券管理頁面（列表 + 新增/編輯彈窗）
import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import '../../../styles/admin.css'
import { API_URL } from "@/utils/api"

const TYPE_LABEL = { 0: '固定金額折抵', 1: '百分比折扣', 2: '免運' }

const emptyForm = {
    code: '', desc: '', type: 1, value: '', min: '', start_at: '', expires_at: '',
}

// 把資料庫的 datetime 轉成 <input type="datetime-local"> 需要的格式
function toInputDateTime(value) {
    if (!value) return ''
    const d = new Date(value)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CouponsAdminPage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalCoupons, setTotalCoupons] = useState(0)
    const perPage = 10

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState(null)


    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
    }

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
                ...(searchTerm && { search: searchTerm }),
            })
            const response = await fetch(`${API_URL}/api/admin/coupons?${queryParams}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!response.ok) throw new Error('獲取優惠券列表失敗')
            const data = await response.json()
            setCoupons(data.data)
            setTotalPages(data.pagination.total_pages)
            setTotalCoupons(data.pagination.total)
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (admin) fetchCoupons()
    }, [admin, currentPage])

    const openCreateModal = () => {
        setEditingId(null)
        setForm(emptyForm)
        setFormError(null)
        setModalOpen(true)
    }

    const openEditModal = (coupon) => {
        setEditingId(coupon.id)
        setForm({
            code: coupon.code,
            desc: coupon.desc,
            type: coupon.type,
            value: coupon.value,
            min: coupon.min,
            start_at: toInputDateTime(coupon.start_at),
            expires_at: toInputDateTime(coupon.expires_at),
            is_active: coupon.is_active,
        })
        setFormError(null)
        setModalOpen(true)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setFormError(null)
        try {
            const url = editingId ? `${API_URL}/api/admin/coupons/${editingId}` : `${API_URL}/api/admin/coupons`
            const method = editingId ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(form),
            })
            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.message || '儲存失敗')
            }
            setModalOpen(false)
            fetchCoupons()
        } catch (err) {
            setFormError(err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此優惠券嗎？')) return
        try {
            const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error('刪除失敗')
            fetchCoupons()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setCurrentPage(1)
        fetchCoupons()
    }


    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="page-header">
                            <h1 className="page-title">優惠券管理</h1>
                            <p className="page-description">新增、編輯、刪除優惠券</p>
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
                                            placeholder="搜尋優惠券代碼、說明..."
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
                                        <span className="admin-stat-value">{totalCoupons}</span>
                                        <span className="admin-stat-label">總優惠券數</span>
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
                                    <button onClick={openCreateModal} className="admin-btn-primary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        新增優惠券
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="admin-loading">
                                <div className="loading-spinner"></div>
                                <p>載入優惠券中...</p>
                            </div>
                        ) : error ? (
                            <div className="admin-error">
                                <p>錯誤：{error}</p>
                                <button onClick={fetchCoupons} className="admin-btn-secondary">重新載入</button>
                            </div>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>代碼</th>
                                            <th>說明</th>
                                            <th>類型</th>
                                            <th>折抵</th>
                                            <th>最低消費</th>
                                            <th>有效期間</th>
                                            <th>狀態</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((c) => (
                                            <tr key={c.id} className="admin-table-row">
                                                <td><strong>{c.code}</strong></td>
                                                <td>{c.desc}</td>
                                                <td>{TYPE_LABEL[c.type] || c.type}</td>
                                                <td>{c.type === 1 ? `${c.value}%` : c.type === 2 ? '—' : `NT$ ${c.value}`}</td>
                                                <td>{c.min ? `NT$ ${c.min}` : '—'}</td>
                                                <td style={{ fontSize: '12px' }}>{formatDate(c.start_at)} ~ {formatDate(c.expires_at)}</td>
                                                <td>
                                                    <span className="category-badge" style={{
                                                        backgroundColor: c.is_valid && c.is_active ? '#e6f7ee' : '#fdf2f2',
                                                        color: c.is_valid && c.is_active ? '#1a9c5b' : '#DC3545'
                                                    }}>
                                                        {c.is_valid && c.is_active ? '啟用中' : '已停用'}
                                                    </span>
                                                </td>
                                                <td className="article-actions">
                                                    <div className="action-buttons">
                                                        <button onClick={() => openEditModal(c)} className="admin-btn-icon edit-btn" title="編輯">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(c.id)} className="admin-btn-icon delete-btn" title="刪除">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

            {modalOpen && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        style={{
                            background: '#fff', borderRadius: '12px', padding: '32px',
                            width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '20px' }}>{editingId ? '編輯優惠券' : '新增優惠券'}</h2>

                        {formError && (
                            <div className="alert alert-error">{formError}</div>
                        )}

                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label">代碼 <span style={{ color: '#DC3545' }}>*</span></label>
                                <input type="text" name="code" value={form.code} onChange={handleFormChange} className="form-input" required maxLength={10} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">說明 <span style={{ color: '#DC3545' }}>*</span></label>
                                <input type="text" name="desc" value={form.desc} onChange={handleFormChange} className="form-input" required maxLength={100} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">類型</label>
                                <select name="type" value={form.type} onChange={handleFormChange} className="form-select">
                                    <option value={1}>百分比折扣</option>
                                    <option value={0}>固定金額折抵</option>
                                    <option value={2}>免運</option>
                                </select>
                            </div>
                            {Number(form.type) !== 2 && (
                                <div className="form-group">
                                    <label className="form-label">折抵值{Number(form.type) === 1 ? '（%，例如 15 代表 85 折）' : '（NT$）'}</label>
                                    <input type="number" name="value" value={form.value} onChange={handleFormChange} className="form-input" min="0" />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">最低消費金額</label>
                                <input type="number" name="min" value={form.min} onChange={handleFormChange} className="form-input" min="0" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">開始時間 <span style={{ color: '#DC3545' }}>*</span></label>
                                <input type="datetime-local" name="start_at" value={form.start_at} onChange={handleFormChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">結束時間 <span style={{ color: '#DC3545' }}>*</span></label>
                                <input type="datetime-local" name="expires_at" value={form.expires_at} onChange={handleFormChange} className="form-input" required />
                            </div>
                            {editingId && (
                                <div className="form-group">
                                    <label className="form-label">狀態</label>
                                    <select name="is_active" value={form.is_active} onChange={handleFormChange} className="form-select">
                                        <option value={1}>啟用</option>
                                        <option value={0}>停用</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="form-btn-cancel" onClick={() => setModalOpen(false)}>取消</button>
                                <button type="submit" className="admin-btn-primary" disabled={saving}>
                                    {saving ? '儲存中...' : '儲存'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    )
}
