"use client"
// 前台限時出清商品頁
import React, { useEffect, useState } from "react"
import style from '@/styles/products.css'
import { useRouter } from "next/navigation"
import { useProduct } from "@/hooks/use-product"
import Breadcrumb from "@/app/_components/breadCrumb"
import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"

import ProductCard from "@/app/_components/products/ProductCard"
import SkeletonCard from "@/app/_components/products/SkeletonCard"
import { API_URL } from "@/utils/api";

export default function SalePage() {
  const router = useRouter()
  const { products, list, isLoading, pagination } = useProduct()

  // 狀態
  const [categories, setCategories] = useState({ brand: [] })
  const [brands, setBrands] = useState([])
  const [attributes, setAttributes] = useState([])
  const [options, setOptions] = useState([])
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(600)
  const [brandExpanded, setBrandExpanded] = useState(false)

  // 抓品牌清單
  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(`${API_URL}/api/products/categories`)
      const result = await res.json()
      if (result.status === "success") {
        setCategories({ brand: result.brand })
      }
    }
    fetchCategories()
  }, [])

  // 抓屬性清單
  useEffect(() => {
    async function fetchAttributes() {
      const res = await fetch(`${API_URL}/api/products/attributes`)
      const result = await res.json()
      if (result.status === "success") {
        const attrs = result.attributes.map(attr => ({
          ...attr,
          options: result.options.filter(opt => opt.attribute_id === attr.id)
        }))
        setAttributes(attrs)
      }
    }
    fetchAttributes()
  }, [])

  // 初始化 + 監聽篩選條件
  useEffect(() => {
    let query = `?price_min=${priceMin}&price_max=${priceMax}`
    if (brands.length > 0) query += `&brand_id=${brands.join(",")}`
    if (options.length > 0) query += `&options=${options.join(",")}`
    list(query)
  }, [brands, options, priceMin, priceMax])

  // 分頁
  const goToPage = (p) => {
    let query = `?price_min=${priceMin}&price_max=${priceMax}`
    if (brands.length > 0) query += `&brand_id=${brands.join(",")}`
    if (options.length > 0) query += `&options=${options.join(",")}`
    query += `&page=${p}&per_page=16`
    router.push(`/products/sales${query}`)
    list(query)
  }

  // 品牌勾選
  const handleBrandChange = (e) => {
    const value = e.target.value
    if (e.target.checked) {
      setBrands([...brands, value])
    } else {
      setBrands(brands.filter(id => id !== value))
    }
  }

  // 屬性勾選
  const handleOptionChange = (attrId, value) => {
    let newOptions = [...options]

    // 先把同屬性的舊選項移掉
    const attrOptionIds = attributes
      .find(a => a.id === attrId)?.options.map(opt => String(opt.id)) || []
    newOptions = newOptions.filter(id => !attrOptionIds.includes(id))

    // 如果有新值就加進去
    if (value) newOptions.push(value)

    setOptions(newOptions)
  }



  if (isLoading) {
    return <div className="loader container"></div>
  }

  return (
    <>
      <Header />
      <div className="container p-page">
        <aside>
          {/* 品牌 */}
          <div className="brand-area">
            <h6>品牌</h6>
            {categories.brand.slice(0, 6).map((c) => (
              <div key={c.id} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`brand-${c.id}`}
                  value={c.id}
                  checked={brands.includes(String(c.id))}
                  onChange={handleBrandChange}
                />
                <label className="form-check-label" htmlFor={`brand-${c.id}`}>
                  {c.name}
                </label>
              </div>
            ))}

            {/* 收合區域 */}
            <div className="collapse" id="moreBrands">
              {categories.brand.slice(6).map((c) => (
                <div key={c.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`brand-${c.id}`}
                    value={c.id}
                    checked={brands.includes(String(c.id))}
                    onChange={handleBrandChange}
                  />
                  <label className="form-check-label" htmlFor={`brand-${c.id}`}>
                    {c.name}
                  </label>
                </div>
              ))}
            </div>

            {/* 切換按鈕 */}
            {categories.brand.length > 6 && (
              <button
                className="btn brand-toggle mt-2"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#moreBrands"
                onClick={() => setBrandExpanded(!brandExpanded)}
              >
                {brandExpanded ? (
                  <>
                    收合 <FontAwesomeIcon icon={faMinus} />
                  </>
                ) : (
                  <>
                    更多 <FontAwesomeIcon icon={faPlus} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* 屬性 */}
          <div className="attr-area">
            <h6>規格</h6>
            {attributes.map(attr => (
              <div className="select-group" key={attr.id}>
                <strong>{attr.name}</strong>
                <select
                  className="form-select"
                  value={options.find(id => attr.options.some(opt => String(opt.id) === id)) || ""}
                  onChange={(e) => handleOptionChange(attr.id, e.target.value)}
                >
                  <option value="">請選擇</option>
                  {attr.options.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.value}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </aside>

        <main>
          <Breadcrumb />
          <div className="product-list">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.length === 0
                ? <p>此條件沒有商品，請重新篩選 🔍</p>
                : products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {/* 分頁 */}
          {pagination && (
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(pagination.page - 1)}>
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(num =>
                    num === 1 ||
                    num === pagination.totalPages ||
                    (num >= pagination.page - 2 && num <= pagination.page + 2)
                  )
                  .map(num => (
                    <li key={num} className={`page-item ${num === pagination.page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => goToPage(num)}>{num}</button>
                    </li>
                  ))}
                <li className={`page-item ${pagination.page === pagination.totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => goToPage(pagination.page + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}
