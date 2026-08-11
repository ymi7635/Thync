'use client'
// 【後台】新增文章頁面
import { useState, useEffect, useRef } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../../../styles/admin.css'
import { API_URL } from "@/utils/api";

export default function CreateArticlePage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()

    const fileInputRef = useRef(null)
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: '',
        cover_image: null,
        tags: ''
    })
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)

    // 權限檢查已暫時移除用於測試
    // useEffect(() => {
    //     if (!isLoading && (!user || user.role !== 'admin')) {
    //         router.replace("/user/login")
    //     }
    // }, [user, isLoading, router])

    // 獲取分類和標籤列表
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/articles/options`)
                if (response.ok) {
                    const data = await response.json()
                    setCategories(data.categories || [])
                    setTags(data.tags || [])
                }
            } catch (err) {
                console.error('獲取選項失敗:', err)
                setError('獲取分類和標籤選項失敗')
            }
        }

        // 移除權限檢查，直接載入選項
        fetchOptions()
    }, [])

    // 處理表單輸入
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // 處理標籤選擇
    const handleTagToggle = (tag) => {
        setSelectedTags(prev => {
            const isSelected = prev.some(t => t.id === tag.id)
            if (isSelected) {
                // 移除標籤
                return prev.filter(t => t.id !== tag.id)
            } else {
                // 添加標籤
                return [...prev, tag]
            }
        })
    }

    // 當選中標籤改變時，更新 formData
    useEffect(() => {
        const tagsString = selectedTags.map(tag => tag.name).join(', ')
        setFormData(prev => ({
            ...prev,
            tags: tagsString
        }))
    }, [selectedTags])

    // 處理圖片上傳
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                setError('請選擇圖片檔案')
                return
            }
            
            // 檢查檔案大小 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('圖片檔案不能超過 5MB')
                return
            }

            setFormData(prev => ({
                ...prev,
                cover_image: file
            }))

            // 建立預覽
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target.result)
            }
            reader.readAsDataURL(file)
            setError(null)
        }
    }

    // 移除圖片
    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            cover_image: null
        }))
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 處理拖放上傳
    const handleDragOver = (e) => {
        e.preventDefault()
        e.currentTarget.classList.add('dragover')
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('dragover')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('dragover')
        
        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type.startsWith('image/')) {
                const event = {
                    target: {
                        files: [file]
                    }
                }
                handleImageChange(event)
            } else {
                setError('請選擇圖片檔案')
            }
        }
    }

    // 提交表單
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 驗證必填欄位
            if (!formData.title.trim()) {
                throw new Error('請輸入文章標題')
            }
            if (!formData.content.trim()) {
                throw new Error('請輸入文章內容')
            }

            // 建立 FormData
            const submitData = new FormData()
            submitData.append('title', formData.title.trim())
            submitData.append('content', formData.content.trim())
            submitData.append('category_id', formData.category_id || '')
            submitData.append('tags', formData.tags.trim())
            
            if (formData.cover_image) {
                submitData.append('cover_image', formData.cover_image)
            }

            const response = await fetch(`${API_URL}/api/articles`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: submitData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || '建立文章失敗')
            }

            const result = await response.json()
            setSuccess(true)
            
            // 3秒後跳轉到文章列表
            setTimeout(() => {
                router.push('/admin/articles')
            }, 2000)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            
            <div className="admin-page">
                <main className="admin-main">
                <div className="admin-container">
                    {/* 頁面標題 */}
                    <div className="create-article-header">
                        <div className="header-content">
                            <div className="header-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="header-text">
                                <h1 className="create-title">新增文章</h1>
                                <p className="create-subtitle">建立新的文章內容</p>
                            </div>
                        </div>
                        <Link href="/admin/articles" className="back-to-list">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            返回列表
                        </Link>
                    </div>

                    {/* 成功訊息 */}
                    {success && (
                        <div className="alert alert-success">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            文章建立成功！即將跳轉到文章列表...
                        </div>
                    )}

                    {/* 錯誤訊息 */}
                    {error && (
                        <div className="alert alert-error">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* 創意文章表單 */}
                    <div className="creative-form-container">
                        <form onSubmit={handleSubmit} className="creative-form">
                            {/* 基本資訊區塊 */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <h3 className="section-title">基本資訊</h3>
                                </div>
                                
                                {/* 文章標題 */}
                                <div className="creative-form-group">
                                    <label htmlFor="title" className="creative-label">
                                        <span className="label-text">文章標題</span>
                                        <span className="label-required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="creative-input"
                                        placeholder="為您的文章取一個吸引人的標題..."
                                        required
                                    />
                                </div>
                                
                                {/* 文章分類 */}
                                <div className="creative-form-group">
                                    <label htmlFor="category_id" className="creative-label">
                                        <span className="label-text">文章分類</span>
                                    </label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleInputChange}
                                            className="creative-select"
                                        >
                                            <option value="">選擇適合的分類...</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="select-arrow">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 內容創作區塊 */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <h3 className="section-title">內容創作</h3>
                                </div>
                                
                                {/* 文章內容 */}
                                <div className="creative-form-group">
                                    <label htmlFor="content" className="creative-label">
                                        <span className="label-text">文章內容</span>
                                        <span className="label-required">*</span>
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        className="creative-textarea"
                                        placeholder="在這裡撰寫您的精彩內容..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* 封面圖片區塊 */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <h3 className="section-title">封面圖片</h3>
                                </div>
                                
                                <div className="creative-form-group">
                                    <label className="creative-label">
                                        <span className="label-text">封面圖片</span>
                                    </label>
                                    
                                    {!imagePreview ? (
                                        <div 
                                            className="file-upload-area"
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="upload-icon">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <div className="upload-text">點擊上傳或拖放圖片到此處</div>
                                            <div className="upload-hint">支援 JPG、PNG、GIF 格式，檔案大小不超過 5MB</div>
                                        </div>
                                    ) : (
                                        <div className="file-preview">
                                            <img src={imagePreview} alt="預覽" className="preview-image" />
                                            <div className="preview-info">
                                                <div className="preview-name">{formData.cover_image?.name}</div>
                                                <div className="preview-size">
                                                    {formData.cover_image ? (formData.cover_image.size / 1024 / 1024).toFixed(2) + ' MB' : ''}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={removeImage}
                                                className="remove-file-btn"
                                                title="移除圖片"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* 標籤與分類區塊 */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div className="section-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <h3 className="section-title">標籤選擇</h3>
                                </div>
                                
                                <div className="creative-form-group">
                                    <label className="creative-label">
                                        <span className="label-text">選擇相關標籤</span>
                                    </label>
                                    <div className="creative-tags-container">
                                        {tags.map(tag => (
                                            <div
                                                key={tag.id}
                                                className={`creative-tag-option ${selectedTags.some(t => t.id === tag.id) ? 'selected' : ''}`}
                                                onClick={() => handleTagToggle(tag)}
                                            >
                                                <span className="tag-name">{tag.name}</span>
                                                {selectedTags.some(t => t.id === tag.id) && (
                                                    <span className="creative-tag-check">✓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 表單操作按鈕 */}
                            <div className="creative-form-actions">
                                <Link href="/admin/articles" className="creative-cancel-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    取消創作
                                </Link>
                                <button 
                                    type="submit" 
                                    className="creative-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading-spinner"></div>
                                            發布中...
                                        </>
                                    ) : (
                                        <>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                                            </svg>
                                            發布文章
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </main>
            </div>
            
        </>
    )
}
