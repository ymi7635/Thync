"use client"
// 前台品牌列表頁
import BrandBox from "./brandBox";
import styles from "@/styles/brand.css";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb"
import Footer from "@/app/_components/footer";


export default function BrandsPage() {


  return (
    <>
      
        <Header />
      

      <div className="container">
        <Breadcrumb />
        <div>
          <BrandBox />
        </div>
      </div>

      <Footer />
    </>
  )
}

