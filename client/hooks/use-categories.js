// 商品分類/品牌選項資料存取 hook
// hooks/use-categories.js
"use client"
import { useState, useEffect } from "react"
import { API_URL } from "@/utils/api";

export function useCategories() {
  const [categories, setCategories] = useState({ main: [], sub: [], brand: [] })

  useEffect(() => {
    fetch(`${API_URL}/api/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setCategories({ main: data.main, sub: data.sub, brand: data.brand })
        }
      })
      .catch(err => console.error(err))
  }, [])

  return categories
}
