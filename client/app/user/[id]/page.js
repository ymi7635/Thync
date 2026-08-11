"use client"
// 會員詳情頁（測試/展示用）

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { useParams } from "next/navigation"

export default function UserDetailPage() {


 const { user, isLoading } = useAuth();
  const router = useRouter();
  const {id} = useParams();
  // router.replace("/user/login")

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/user/login")// 導頁，當Laoding結束且沒有使用者時，切換到登入頁
    }
  }, [user, isLoading])


  if (isLoading || !user) return null

  return (
    <div className="container py-3">
    <h1>使用者{id}的主頁</h1>
    <Link className="btn btn-primary" href="/">回首頁</Link>
    </div>
  )

}
