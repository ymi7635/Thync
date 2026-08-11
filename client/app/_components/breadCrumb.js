"use client"
// 全站共用的麵包屑導覽列，依目前路徑自動組出商品分類/會員頁的階層路徑
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from "@/utils/api";

export default function Breadcrumb(props) {
  return (
    <Suspense fallback={null}>
      <BreadcrumbInner {...props} />
    </Suspense>
  )
}

function BreadcrumbInner({ product }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState({ main: [], sub: [], brand: [] })

  // 抓分類清單（只抓一次）
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

  const mid = searchParams.get("mid")
  const cid = searchParams.get("cid")
  const mainName = categories.main.find(m => m.id === Number(mid))?.name
  const subName = categories.sub.find(s => s.id === Number(cid))?.name

  let items = [{ label: <><FontAwesomeIcon icon={faHouse} style={{ marginRight: 4 }} />首頁</>, href: "/" }]

  // 商品頁
  if (pathname === "/products") {
    items.push({ label: "所有商品", href: "/products" })
    if (mid && mainName) items.push({ label: mainName, href: `/products?mid=${mid}` })
    if (cid && subName) items.push({ label: subName, href: `/products?mid=${mid}&cid=${cid}` })
  }

  if (pathname.startsWith("/products/") && product) {
    items.push({ label: "所有商品", href: "/products" })
    items.push({ label: product.main_name, href: `/products?mid=${product.main_id}` })
    items.push({ label: product.sub_name, href: `/products?mid=${product.main_id}&cid=${product.sub_id}` })
    items.push({ label: product.product_name, href: `/products/${product.id}` })
  }

  // 出清
  if (pathname === "/products/sales") {
    items.push({ label: "限時出清", href: "/products/sales" })
  }

  // 品牌
  if (pathname === "/products/brands") {
    items.push({ label: "所有品牌", href: "/products/brands" })
  }

  // 會員頁
  if (pathname.startsWith("/user")) {
    items.push({ label: "會員中心", href: "/user" })
    if (pathname.includes("edit")) items.push({ label: "會員資料管理", href: "/user/edit" })
    if (pathname.includes("order")) items.push({ label: "訂單查詢", href: "/user/order" })
    if (pathname.includes("coupon")) items.push({ label: "我的優惠券", href: "/user/coupon" })
    if (pathname.includes("wishlist")) items.push({ label: "追蹤商品", href: "/user/wishlist" })
    if (pathname.includes("favorites")) items.push({ label: "已收藏文章", href: "/user/favorites" })
    if (pathname.includes("change-password"))
      items.push({ label: "變更密碼", href: "/user/change-password" });

    // 若為 /user/order/[orderNo]，自動加上訂單號
    const orderDetailMatch = pathname.match(/^\/user\/order\/(od\d+)/);
    if (orderDetailMatch) {
      items.push({ label: orderDetailMatch[1], href: `/user/order/${orderDetailMatch[1]}` })
    }
  }

  const [iconReady, setIconReady] = useState(false);

  useEffect(() => {
    setIconReady(true); // 這裡可以加載完資源後再 set
  }, []);

  if (!iconReady) return null; // 或顯示 loading


  return (
    <nav aria-label="breadcrumb" className="breadcrumb mt-4">
      <ol>
        {items.map((item, idx) => (
          <li key={idx}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            {idx < items.length - 1 && <span>
              <FontAwesomeIcon icon={faAngleRight} />
            </span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
