'use client'
// 【後台】編輯文章頁面
import { useState, useEffect, useRef } from 'react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import '../../../../../styles/admin.css'
import { API_URL } from "@/utils/api";

export default function EditArticlePage() {
    const { admin, isLoading, getToken } = useAdminAuth()
    const router = useRouter()

    const params = useParams()
    const fileInputRef = useRef(null)
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: '',
        cover_image: null,
        current_cover_image: '',
        tags: ''
    })
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)

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

    // 獲取文章資料和分類列表
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchLoading(true)
                
                // 同時獲取文章資料和分類列表
                const [articleResponse, optionsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/articles/${params.id}`),
                    fetch(`${API_URL}/api/articles/options`)
                ])

                if (!articleResponse.ok) {
                    throw new Error('文章不存在或無法載入')
                }

                const articleData = await articleResponse.json()
                const article = articleData.data

                // 處理標籤
                let tagsString = ''
                if (article.tags && Array.isArray(article.tags)) {
                    tagsString = article.tags.map(tag => tag.name || tag).join(', ')
                } else if (typeof article.tags === 'string') {
                    tagsString = article.tags
                }

                setFormData({
                    title: article.title || '',
                    content: article.content || '',
                    category_id: article.category_id?.toString() || '',
                    cover_image: null,
                    current_cover_image: article.cover_image || '',
                    tags: tagsString
                })

                // 設置當前封面圖片預覽
                if (article.cover_image) {
                    setImagePreview(`/images/articles/${article.cover_image}`)
                }

                // 處理分類和標籤資料
                if (optionsResponse.ok) {
                    const optionsData = await optionsResponse.json()
                    setCategories(optionsData.categories || [])
                    setTags(optionsData.tags || [])
                    
                    // 處理已選擇的標籤
                    if (article.tags && Array.isArray(article.tags)) {
                        setSelectedTags(article.tags)
                    } else if (typeof article.tags === 'string' && article.tags) {
                        // 如果標籤是字符串，需要根據名稱找到對應的標籤對象
                        const tagNames = article.tags.split(',').map(name => name.trim())
                        const matchedTags = optionsData.tags.filter(tag => 
                            tagNames.includes(tag.name)
                        )
                        setSelectedTags(matchedTags)
                    }
                }

            } catch (err) {
                setError(err.message)
            } finally {
                setFetchLoading(false)
            }
        }

        // 移除權限檢查，直接載入資料
        if (params.id) {
            fetchData()
        }
    }, [params.id])

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
            cover_image: null,
            current_cover_image: ''
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
            
            // 如果有新上傳的圖片，加入到表單中
            if (formData.cover_image) {
                submitData.append('cover_image', formData.cover_image)
            } else if (formData.current_cover_image) {
                // 保持現有圖片
                submitData.append('keep_current_image', 'true')
                submitData.append('current_cover_image', formData.current_cover_image)
            }

            const response = await fetch(`${API_URL}/api/articles/${params.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: submitData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || '更新文章失敗')
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


    if (fetchLoading) {
        return (
            <div className="admin-page">
                <main className="admin-main">
                    <div className="admin-container">
                        <div className="admin-loading">
                            <div className="loading-spinner"></div>
                            <p>載入文章資料中...</p>
                        </div>
                    </div>
                </main>
            </div>
        )
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
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="header-text">
                                <h1 className="create-title">編輯文章</h1>
                                <p className="create-subtitle">修改文章內容和設定</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link 
                                href={`/articles/${params.id}`} 
                                className="back-to-list"
                                target="_blank"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                預覽
                            </Link>
                            <Link href="/admin/articles" className="back-to-list">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                返回列表
                            </Link>
                        </div>
                    </div>

                    {/* 成功訊息 */}
                    {success && (
                        <div className="alert alert-success">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            文章更新成功！即將跳轉到文章列表...
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

                    {/* 文章表單 */}
                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* 文章標題 */}
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                文章標題 <span style={{color: '#DC3545'}}>*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="form-input"
                                placeholder="請輸入文章標題"
                                required
                            />
                        </div>

                        {/* 文章分類 */}
                        <div className="form-group">
                            <label htmlFor="category_id" className="form-label">文章分類</label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">請選擇分類</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 封面圖片 */}
                        <div className="form-group">
                            <label className="form-label">封面圖片</label>
                            
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
                                        <div className="preview-name">
                                            {formData.cover_image?.name || '目前封面圖片'}
                                        </div>
                                        <div className="preview-size">
                                            {formData.cover_image ? 
                                                (formData.cover_image.size / 1024 / 1024).toFixed(2) + ' MB' : 
                                                '現有圖片'
                                            }
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

                        {/* 文章內容 */}
                        <div className="form-group">
                            <label htmlFor="content" className="form-label">
                                文章內容 <span style={{color: '#DC3545'}}>*</span>
                            </label>
                            <div className="editor-container">
                                <div className="editor-toolbar">
                                    <span style={{ fontSize: '14px', color: '#6B6A67' }}>
                                        支援 HTML 標籤格式化文字
                                    </span>
                                </div>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    className="form-textarea editor-content"
                                    placeholder="請輸入文章內容，支援HTML標籤..."
                                    rows="15"
                                    required
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
                        <div className="form-actions">
                            <Link href="/admin/articles" className="form-btn-cancel">
                                取消
                            </Link>
                            <button 
                                type="submit" 
                                className="admin-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="loading-spinner" style={{width: '16px', height: '16px', marginRight: '8px'}}></div>
                                        更新中...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        更新文章
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                </main>
            </div>
            
        </>
    )
}
