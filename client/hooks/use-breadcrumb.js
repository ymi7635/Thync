// 組出麵包屑路徑資料的輔助 hook（目前未被使用，邏輯改寫進 breadCrumb.js 元件本身）
// hooks/use-breadcrumb.js
"use client"
import { usePathname, useSearchParams } from "next/navigation"
import { useCategories } from "./use-categories"
import { useProduct } from "./use-product"

export function useBreadcrumb() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { main, sub } = useCategories()
  const { product } = useProduct()

  let items = [{ label: "首頁", href: "/" }]

  // 商品列表頁
  if (pathname === "/products") {
    items.push({ label: "商品列表", href: "/products" })

    const mid = searchParams.get("mid")
    const cid = searchParams.get("cid")

    if (mid) {
      const mainCat = main.find(m => m.id === Number(mid))
      if (mainCat) items.push({ label: mainCat.name, href: `/products?mid=${mid}` })
    }

    if (cid) {
      const subCat = sub.find(s => s.id === Number(cid))
      if (subCat) items.push({ label: subCat.name, href: `/products?mid=${mid}&cid=${cid}` })
    }
  }

  // 商品細節頁
  if (pathname.startsWith("/products/")) {
    items.push({ label: "商品列表", href: "/products" })

    if (product) {
      items.push(
        { label: product.category_main_name, href: `/products?mid=${product.main_id}` },
        { label: product.category_sub_name, href: `/products?mid=${product.main_id}&cid=${product.sub_id}` },
        { label: product.product_name, href: `/products/${product.id}` }
      )
    }
  }

  return items
}
