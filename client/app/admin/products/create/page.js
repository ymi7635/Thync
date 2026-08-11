'use client'
// 【後台】新增商品頁面
import { useEffect } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../../../styles/admin.css'
import ProductForm from '../productForm'

export default function CreateProductPage() {
    const { admin, isLoading } = useAdminAuth()
    const router = useRouter()



    return (
        <>
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="create-article-header">
                            <div className="header-content">
                                <div className="header-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="header-text">
                                    <h1 className="create-title">新增商品</h1>
                                    <p className="create-subtitle">建立新的商品資料</p>
                                </div>
                            </div>
                            <Link href="/admin/products" className="back-to-list">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                返回列表
                            </Link>
                        </div>

                        <ProductForm mode="create" />
                    </div>
                </main>
            </div>
        </>
    )
}
