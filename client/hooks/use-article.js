'use client'
// 文章相關資料存取 hook（列表/單篇/分類標籤選項）
import { useState, useEffect } from 'react'
import { API_URL } from "@/utils/api";

export default function useArticle() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])

  // 獲取文章列表
  const fetchArticles = async (params = {}) => {
    try {
      console.log('📝 開始獲取文章，參數：', params)
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key])
        }
      })
      
      const url = `${API_URL}/api/articles${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      console.log('🌐 API 請求網址：', url)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 API 回應資料：', data)
      
      if (data.status === 'success') {
        console.log('✅ 成功獲取文章數量：', data.data.articles?.length || 0)
        setArticles(data.data.articles || [])
        setPagination(data.data.pagination || {})
      } else {
        throw new Error(data.message || '獲取文章失敗')
      }
    } catch (err) {
      console.error('❌ 獲取文章失敗：', err)
      setError(err.message)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  // 獲取分類和標籤選項
  const fetchOptions = async () => {
    try {
      console.log('🏷️ 開始獲取分類和標籤選項')
      const response = await fetch(`${API_URL}/api/articles/categories`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🏷️ 分類標籤回應：', data)
      
      if (data.status === 'success') {
        console.log('✅ 分類數量：', data.categories?.length || 0)
        console.log('✅ 標籤數量：', data.tags?.length || 0)
        setCategories(data.categories || [])
        setTags(data.tags || [])
      }
    } catch (err) {
      console.error('❌ 獲取選項失敗：', err)
    }
  }

  // 獲取單一文章
  const fetchSingleArticle = async (id) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/articles/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        return data.data
      } else {
        throw new Error(data.message || '獲取文章失敗')
      }
    } catch (err) {
      console.error('Failed to fetch single article:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    // 狀態
    articles,
    loading,
    error,
    pagination,
    categories,
    tags,
    
    // 方法
    fetchArticles,
    fetchOptions,
    fetchSingleArticle,
    
    // 重置方法
    clearError: () => setError(null),
    resetArticles: () => setArticles([])
  }
}