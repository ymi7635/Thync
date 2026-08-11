'use client'
// 【後台】管理後台首頁儀表板
import Link from 'next/link'
import '../../styles/admin.css'

export default function AdminPage() {
    return (
        <div className="admin-page">
            <main className="admin-main">
                <div className="admin-container">
                    <div className="page-header">
                        <h1 className="page-title">管理後台</h1>
                        <p className="page-description">選擇下面的項目，或直接用上方導覽列切換</p>
                    </div>

                    {/* 管理功能卡片 */}
                    <div className="admin-dashboard">
                        <div className="dashboard-grid">
                            {/* 商品管理 */}
                            <Link href="/admin/products" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">商品管理</h3>
                                    <p className="card-description">新增、編輯、上下架商品</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>

                            {/* 訂單管理 */}
                            <Link href="/admin/orders" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 2h6l1 4H8l1-4zM4 6h16l-1.5 14a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2L4 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">訂單管理</h3>
                                    <p className="card-description">查看訂單明細、更新訂單狀態</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>

                            {/* 會員管理 */}
                            <Link href="/admin/users" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">會員管理</h3>
                                    <p className="card-description">查看會員列表、啟用或停權帳號</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>

                            {/* 優惠券管理 */}
                            <Link href="/admin/coupons" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M2 9a3 3 0 1 0 0 6v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-3a3 3 0 1 1 0-6V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="9" y1="5" x2="9" y2="19" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">優惠券管理</h3>
                                    <p className="card-description">新增、編輯、刪除優惠券</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>

                            {/* 文章管理卡片 */}
                            <Link href="/admin/articles" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">文章管理</h3>
                                    <p className="card-description">管理所有文章內容，包含新增、編輯、刪除功能</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>

                            {/* 返回前台卡片 */}
                            <Link href="/" className="dashboard-card">
                                <div className="card-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">返回前台</h3>
                                    <p className="card-description">回到網站前台頁面</p>
                                </div>
                                <div className="card-arrow">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
