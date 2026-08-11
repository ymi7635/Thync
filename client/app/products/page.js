"use client"
// 前台商品列表頁（分類/品牌/價格/屬性篩選 + 分頁）
import React, { Suspense } from "react"
import style from '@/styles/products.css'
import { useSearchParams, useRouter } from "next/navigation"
import { useProduct } from "@/hooks/use-product"
import { useEffect, useState } from "react"
import Breadcrumb from "@/app/_components/breadCrumb"
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import Sidebar from "@/app/_components/products/Sidebar";
import ProductCard from "@/app/_components/products/ProductCard";
import SkeletonCard from "@/app/_components/products/SkeletonCard";
import { API_URL } from "@/utils/api";


export default function ProductPage() {
  return (
    <Suspense fallback={<div className="loader container"></div>}>
      <ProductPageInner />
    </Suspense>
  )
}

function ProductPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { products, list, isLoading, pagination } = useProduct()
  const [categories, setCategories] = useState({ main: [], sub: [], brand: [] })
  const [attributes, setAttributes] = useState([])
  const [options, setOptions] = useState([])
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [brands, setBrands] = useState([])
  const [sidebarReady, setSidebar] = useState(false);



  const mid = searchParams.get("mid") || ""
  const cid = searchParams.get("cid") || ""
  const page = Number(searchParams.get("page")) || 1
  const per_page = 16

  // 品牌多選處理
  useEffect(() => {
    const brandParam = searchParams.get("brand_id")
    setBrands(brandParam ? brandParam.split(",") : [])
  }, [searchParams])

  // 抓分類清單
  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(`${API_URL}/api/products/categories`)
      const result = await res.json()
      if (result.status === "success") {
        setCategories({
          main: result.main,
          sub: result.sub,
          brand: result.brand
        })
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

  // URL 變動 → 抓產品列表
  useEffect(() => {
    list("?" + searchParams.toString())
  }, [searchParams])

  // 換頁
  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", p)
    params.set("per_page", per_page)
    router.push(`/products?${params.toString()}`)
  }

  // 篩選處理 -------------------------------------
  const MainChange = (e) => {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value) {
      params.set("mid", value)
      params.delete("cid")
    } else {
      params.delete("mid")
      params.delete("cid")
    }
    params.delete("page")   // ⭐ 重設分頁
    router.push(`/products?${params.toString()}`)
  }

  const SubChange = (e) => {
    const params = new URLSearchParams(searchParams.toString())
    const value = e.target.value
    if (value) {
      params.set("cid", value)
    } else {
      params.delete("cid")
    }
    params.delete("page")   // ⭐ 重設分頁
    router.push(`/products?${params.toString()}`)
  }

  const BrandChange = (e) => {
    const value = e.target.value
    let newBrands = []
    if (e.target.checked) {
      newBrands = [...brands, value]
    } else {
      newBrands = brands.filter(id => id !== value)
    }
    setBrands(newBrands)
    const params = new URLSearchParams(searchParams.toString())
    if (newBrands.length > 0) {
      params.set("brand_id", newBrands.join(","))
    } else {
      params.delete("brand_id")
    }
    params.delete("page")   // ⭐ 重設分頁
    router.push(`/products?${params.toString()}`)
  }

  const PriceChange = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceMin) params.set("price_min", priceMin)
    else params.delete("price_min")
    if (priceMax) params.set("price_max", priceMax)
    else params.delete("price_max")
    params.delete("page")   // ⭐ 重設分頁
    router.push(`/products?${params.toString()}`)
  }

  const OptionChange = (e) => {
    const value = e.target.value
    let newOptions = []
    if (e.target.checked) {
      newOptions = [...options, value]
    } else {
      newOptions = options.filter(id => id !== value)
    }
    setOptions(newOptions)
    const params = new URLSearchParams(searchParams.toString())
    if (newOptions.length > 0) {
      params.set("options", newOptions.join(","))
    } else {
      params.delete("options")
    }
    params.delete("page")   // ⭐ 重設分頁
    router.push(`/products?${params.toString()}`)
  }

  const ClearFilters = () => {
    setOptions([])
    setPriceMin("")
    setPriceMax("")
    setBrands([])
    router.replace("/products")
  }

  useEffect(() => {
    setSidebar(true); // 這裡可以加載完資源後再 set
  }, []);

  if (!sidebarReady) return null; // 或顯示 loading


  // -------------------------------------

  const filteredSubs = categories.sub.filter((s) => s.main_id == mid)
  const filteredAttrs = mid
    ? attributes.filter(attr => String(attr.main_id) === mid)
    : attributes



  return (
    <>
      <Header />
      <div className="container p-page d-md-flex flex-md-row flex-column">
        <Sidebar
          categories={categories}
          filteredSubs={filteredSubs}
          filteredAttrs={filteredAttrs}
          mid={mid}
          cid={cid}
          brands={brands}
          options={options}
          setOptions={setOptions}
          priceMin={priceMin}
          priceMax={priceMax}
          setPriceMin={setPriceMin}
          setPriceMax={setPriceMax}
          MainChange={MainChange}
          SubChange={SubChange}
          BrandChange={BrandChange}
          OptionChange={OptionChange}
          PriceChange={PriceChange}
          ClearFilters={ClearFilters}
        />
        <main>
          <Breadcrumb />


          <div className="product-list">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, i) => <ProductCard key={i} p={p} />)
            }
          </div>

          {/* 分頁 */}
          {pagination && (
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(pagination.page - 1)}
                  >
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(num =>
                    num === 1 ||
                    num === pagination.totalPages ||
                    (num >= pagination.page - 2 && num <= pagination.page + 2)
                  )
                  .map((num, idx, arr) => {
                    if (idx > 0 && num - arr[idx - 1] > 1) {
                      return (
                        <React.Fragment key={num}>
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                          <li className={`page-item ${num === pagination.page ? "active" : ""}`}>
                            <button className="page-link" onClick={() => goToPage(num)}>{num}</button>
                          </li>
                        </React.Fragment>
                      )
                    }
                    return (
                      <li key={num} className={`page-item ${num === pagination.page ? "active" : ""}`}>
                        <button className="page-link" onClick={() => goToPage(num)}>{num}</button>
                      </li>
                    )
                  })}
                <li className={`page-item ${pagination.page === pagination.totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(pagination.page + 1)}
                  >
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
