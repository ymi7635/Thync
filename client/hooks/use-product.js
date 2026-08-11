"use client"
// 商品相關資料存取 hook（列表/單一商品）

import { createContext, useContext, useEffect, useState } from "react"
import { API_URL } from "@/utils/api";

const ProductContext = createContext(null)
ProductContext.displayName = "ProductContext"

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [product, setProduct] = useState(null)   // ← 新增：單一商品
  const [pagination, setPagination] = useState(null)
  // isLoading 初始值建議設 false
  const [isLoading, setIsLoading] = useState(false)

  // 取得商品列表
  const list = async (query = "") => {
    const API = `${API_URL}/api/products${query}`
    try {
      setIsLoading(true)  // ⭐ 開始 loading
      const res = await fetch(API)
      const result = await res.json()
      if (result.status === "success") {
        setProducts(result.data)
        setPagination(result.pagination || null)
      }
    } catch (error) {
      setProducts([])
      setPagination(null)
      alert(error.message)
    } finally {
      setIsLoading(false) // ⭐ 保證最後關閉
    }
  }

  // 抓單一商品
  const getOne = async (id) => {
    const API = `${API_URL}/api/products/${id}`
    try {
      setIsLoading(true)
      const res = await fetch(API)
      const result = await res.json()
      if (result.status === "success") {
        setProduct(result.data)   // ← 這裡直接塞單一商品
      } else {
        setProduct(null)
      }
    } catch (error) {
      setProduct(null)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProductContext.Provider value={{ products, list, isLoading, product, getOne,pagination }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProduct = () => useContext(ProductContext)