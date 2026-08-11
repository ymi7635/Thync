'use client'
// 【後台】商品新增/編輯共用表單元件（含主圖與介紹圖各自上傳/刪除）
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { API_URL } from "@/utils/api"

// 商品新增／編輯共用表單。mode: 'create' | 'edit'
export default function ProductForm({ mode, productId }) {
    const { getToken } = useAdminAuth()
    const fileInputRef = useRef(null)
    const introFileInputRef = useRef(null)

    const [mainCategories, setMainCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [brands, setBrands] = useState([])

    const [formData, setFormData] = useState({
        category_main_id: '',
        category_sub_id: '',
        brand_id: '',
        name: '',
        modal: '',
        price: '',
        intro: '',
        spec: '',
        is_valid: 1,
    })
    const [existingImages, setExistingImages] = useState([])
    const [newFiles, setNewFiles] = useState([])
    const [newPreviews, setNewPreviews] = useState([])
    const [existingIntroImages, setExistingIntroImages] = useState([])
    const [newIntroFiles, setNewIntroFiles] = useState([])
    const [newIntroPreviews, setNewIntroPreviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(mode === 'edit')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // 分類/品牌選項
    useEffect(() => {
        fetch(`${API_URL}/api/products/categories`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setMainCategories(data.main || [])
                    setSubCategories(data.sub || [])
                    setBrands(data.brand || [])
                }
            })
            .catch(err => console.error('取得分類失敗:', err))
    }, [])

    // 編輯模式：載入商品資料
    useEffect(() => {
        if (mode !== 'edit' || !productId) return
        const fetchProduct = async () => {
            try {
                setFetchLoading(true)
                const res = await fetch(`${API_URL}/api/admin/products/${productId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                })
                if (!res.ok) throw new Error('商品不存在或無法載入')
                const data = await res.json()
                const p = data.data
                setFormData({
                    category_main_id: p.category_main_id?.toString() || '',
                    category_sub_id: p.category_sub_id?.toString() || '',
                    brand_id: p.brand_id?.toString() || '',
                    name: p.name || '',
                    modal: p.modal === '-' ? '' : (p.modal || ''),
                    price: p.price ?? '',
                    intro: p.intro || '',
                    spec: p.spec || '',
                    is_valid: p.is_valid,
                })
                setExistingImages(p.images || [])
                setExistingIntroImages(p.introImages || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setFetchLoading(false)
            }
        }
        fetchProduct()
    }, [mode, productId])

    const filteredSubCategories = subCategories.filter(
        s => String(s.main_id) === String(formData.category_main_id)
    )

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // 主分類變更時，子分類要重選
            ...(name === 'category_main_id' ? { category_sub_id: '' } : {}),
        }))
    }

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        setNewFiles(prev => [...prev, ...files])
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => setNewPreviews(prev => [...prev, ev.target.result])
            reader.readAsDataURL(file)
        })
    }

    const removeNewFile = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
        setNewPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = async (imageId) => {
        if (!confirm('確定要刪除這張圖片嗎？')) return
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${productId}/images/${imageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error('刪除圖片失敗')
            setExistingImages(prev => prev.filter(img => img.id !== imageId))
        } catch (err) {
            alert(err.message)
        }
    }

    const handleIntroFilesChange = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        setNewIntroFiles(prev => [...prev, ...files])
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => setNewIntroPreviews(prev => [...prev, ev.target.result])
            reader.readAsDataURL(file)
        })
    }

    const removeNewIntroFile = (index) => {
        setNewIntroFiles(prev => prev.filter((_, i) => i !== index))
        setNewIntroPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingIntroImage = async (imageId) => {
        if (!confirm('確定要刪除這張介紹圖嗎？')) return
        try {
            const res = await fetch(`${API_URL}/api/admin/products/${productId}/intro-images/${imageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` }
            })
            if (!res.ok) throw new Error('刪除介紹圖失敗')
            setExistingIntroImages(prev => prev.filter(img => img.id !== imageId))
        } catch (err) {
            alert(err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!formData.category_main_id || !formData.category_sub_id || !formData.name.trim() || !formData.price) {
                throw new Error('請填寫主分類、子分類、商品名稱、價格')
            }

            const submitData = new FormData()
            submitData.append('category_main_id', formData.category_main_id)
            submitData.append('category_sub_id', formData.category_sub_id)
            submitData.append('brand_id', formData.brand_id || '')
            submitData.append('name', formData.name.trim())
            submitData.append('modal', formData.modal.trim())
            submitData.append('price', formData.price)
            submitData.append('intro', formData.intro)
            submitData.append('spec', formData.spec)
            if (mode === 'edit') submitData.append('is_valid', formData.is_valid ? 1 : 0)
            newFiles.forEach(file => submitData.append('images', file))
            newIntroFiles.forEach(file => submitData.append('introImages', file))

            const url = mode === 'create'
                ? `${API_URL}/api/admin/products`
                : `${API_URL}/api/admin/products/${productId}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${getToken()}` },
                body: submitData,
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.message || '儲存失敗')
            }

            setSuccess(true)
            setTimeout(() => {
                window.location.href = '/admin/products'
            }, 1200)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetchLoading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>載入商品資料中...</p>
            </div>
        )
    }

    return (
        <>
            {success && (
                <div className="alert alert-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {mode === 'create' ? '商品新增成功！' : '商品更新成功！'}即將跳轉回商品列表...
                </div>
            )}
            {error && (
                <div className="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label className="form-label">主分類 <span style={{ color: '#DC3545' }}>*</span></label>
                    <select name="category_main_id" value={formData.category_main_id} onChange={handleInputChange} className="form-select" required>
                        <option value="">請選擇主分類</option>
                        {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">子分類 <span style={{ color: '#DC3545' }}>*</span></label>
                    <select name="category_sub_id" value={formData.category_sub_id} onChange={handleInputChange} className="form-select" required disabled={!formData.category_main_id}>
                        <option value="">請選擇子分類</option>
                        {filteredSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">品牌</label>
                    <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} className="form-select">
                        <option value="">未指定</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">商品名稱 <span style={{ color: '#DC3545' }}>*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="請輸入商品名稱" required />
                </div>

                <div className="form-group">
                    <label className="form-label">型號</label>
                    <input type="text" name="modal" value={formData.modal} onChange={handleInputChange} className="form-input" placeholder="型號（選填）" />
                </div>

                <div className="form-group">
                    <label className="form-label">價格 <span style={{ color: '#DC3545' }}>*</span></label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="form-input" placeholder="請輸入價格" min="0" required />
                </div>

                <div className="form-group">
                    <label className="form-label">商品介紹</label>
                    <textarea name="intro" value={formData.intro} onChange={handleInputChange} className="form-textarea" rows="6" placeholder="商品特色介紹..." />
                </div>

                <div className="form-group">
                    <label className="form-label">商品規格</label>
                    <textarea name="spec" value={formData.spec} onChange={handleInputChange} className="form-textarea" rows="8" placeholder="商品規格表..." />
                </div>

                {mode === 'edit' && (
                    <div className="form-group">
                        <label className="form-label">上架狀態</label>
                        <select name="is_valid" value={formData.is_valid} onChange={handleInputChange} className="form-select">
                            <option value={1}>上架中</option>
                            <option value={0}>已下架</option>
                        </select>
                    </div>
                )}

                {mode === 'edit' && existingImages.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">現有圖片</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {existingImages.map(img => (
                                <div key={img.id} className="file-preview" style={{ width: '140px' }}>
                                    <img src={`/images/products/uploads/${img.file}`} alt="" className="preview-image" onError={(e) => { e.target.src = '/images/no-image.jpg' }} />
                                    <button type="button" onClick={() => removeExistingImage(img.id)} className="remove-file-btn" title="刪除圖片">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">{mode === 'edit' ? '新增圖片' : '商品圖片'}</label>
                    <div
                        className="file-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="upload-text">點擊選擇圖片（可多選）</div>
                        <div className="upload-hint">支援 JPG、PNG，單張不超過 5MB</div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFilesChange} accept="image/*" multiple style={{ display: 'none' }} />

                    {newPreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {newPreviews.map((src, i) => (
                                <div key={i} className="file-preview" style={{ width: '140px' }}>
                                    <img src={src} alt="" className="preview-image" />
                                    <button type="button" onClick={() => removeNewFile(i)} className="remove-file-btn" title="移除">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {mode === 'edit' && existingIntroImages.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">現有介紹圖</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {existingIntroImages.map(img => (
                                <div key={img.id} className="file-preview" style={{ width: '140px' }}>
                                    <img src={`/images/products/uploads/${img.file}`} alt="" className="preview-image" onError={(e) => { e.target.src = '/images/no-image.jpg' }} />
                                    <button type="button" onClick={() => removeExistingIntroImage(img.id)} className="remove-file-btn" title="刪除介紹圖">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">{mode === 'edit' ? '新增介紹圖' : '商品介紹圖'}</label>
                    <p style={{ fontSize: '13px', color: '#888', marginTop: '-6px', marginBottom: '10px' }}>
                        跟上面的「商品圖片」不同——這裡是商品詳情頁「介紹說明」段落用的長圖，可放多張。
                    </p>
                    <div
                        className="file-upload-area"
                        onClick={() => introFileInputRef.current?.click()}
                    >
                        <div className="upload-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="upload-text">點擊選擇介紹圖（可多選）</div>
                        <div className="upload-hint">支援 JPG、PNG，單張不超過 5MB</div>
                    </div>
                    <input type="file" ref={introFileInputRef} onChange={handleIntroFilesChange} accept="image/*" multiple style={{ display: 'none' }} />

                    {newIntroPreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {newIntroPreviews.map((src, i) => (
                                <div key={i} className="file-preview" style={{ width: '140px' }}>
                                    <img src={src} alt="" className="preview-image" />
                                    <button type="button" onClick={() => removeNewIntroFile(i)} className="remove-file-btn" title="移除">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <Link href="/admin/products" className="form-btn-cancel">取消</Link>
                    <button type="submit" className="admin-btn-primary" disabled={loading}>
                        {loading ? '儲存中...' : (mode === 'create' ? '新增商品' : '更新商品')}
                    </button>
                </div>
            </form>
        </>
    )
}
