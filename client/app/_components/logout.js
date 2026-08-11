'use client'
// 早期測試用的簡易登入表單元件（非正式登入頁）
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
export default function Logout() {

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const {login} = useAuth()

  const onclick = () => {
    login(account, password);
  }
  return (
    <>
      <h1>
      <span >登出</span>
      <span >狀態</span>
      </h1>
      <div className="input-group mb-2">
        <span className={`input-group-text`}>帳號</span>
        <input type="text" name="account" className="form-control" value={account} onChange={(e) => { setAccount(e.target.value) }} />
      </div>
      <div className="input-group mb-2">
        <span className={`input-group-text`}>密碼</span>
        <input type="password" name="password" className="form-control" value={password} onChange={(e) => { setPassword(e.target.value) }} />
      </div>
      <div className="d-flex">
        <div className="btn btn-primary ms-auto btn-login" onClick={onclick}>送出</div>
      </div>
    </>
  )
}