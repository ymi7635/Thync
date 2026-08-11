'use client'
// 【後台】編輯商品頁面
import { useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import '../../../../../styles/admin.css'
import ProductForm from '../../productForm'

export default function EditProductPage() {
    const { admin, isLoading } = useAdminAuth()
    const router = useRouter()
    const params = useParams()



    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="create-article-header">
                            <div className="header-content">
                                <div className="header-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <div className="header-text">
                                    <h1 className="create-title">編輯商品</h1>
                                    <p className="create-subtitle">修改商品資料</p>
                                </div>
                            </div>
                            <Link href="/admin/products" className="back-to-list">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                返回列表
                            </Link>
                        </div>

                        <ProductForm mode="edit" productId={params.id} />
                    </div>
                </main>
            </div>
        </>
    )
}
