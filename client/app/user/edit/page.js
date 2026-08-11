"use client";
// 會員中心「編輯資料」頁面（含刪除帳號功能）

import styles from "@/styles/user-profile.css";
import "@/styles/loader.css";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Header from "@/app/_components/header";
import Breadcrumb from "@/app/_components/breadCrumb";
import Sidebar from "@/app/_components/user/sidebar";
import Footer from "@/app/_components/footer";
import { swalError, swalSuccess, swalConfirm } from "@/utils/swal";
import { API_URL } from "@/utils/api";

export default function UserEditPage() {
  const { user, setUser, isLoading } = useAuth();
  const [formData, setFormData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 編輯模式狀態
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = "/user/login";
      } else {
        setIsInitialized(true);
      }
    }
  }, [user, isLoading]);

  // 當 user 載入後，初始化 formData
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }

    // if (user === null && isInitialized) {
    //   window.location.href = "/user/login";
    // }

    if (user && isInitialized) {
      console.log("初始化用戶資料:", user);
      setFormData({
        account: user.account ?? "",
        mail: user.mail ?? "",
        name: user.name ?? "",
        phone: user.phone ?? "",
        gender_id: user.gender_id != null ? String(user.gender_id) : "",
        year: user.year ?? "",
        month: user.month ?? "",
        date: user.date ?? "",
        city_id: user.city_id ?? "",
        address: user.address ?? "",
        img: user.img ?? "",
      });
      console.log("初始化 formData:", user);
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // 等待 user 載入中
  if (!isInitialized || !formData) return <div className="loader"></div>;

  // 處理表單輸入變化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 處理圖片上傳
  const handleImageClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  // 圖片上傳
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          img: file, // 儲存檔案物件
          imgPreview: event.target.result, // 預覽用
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 編輯模式
  const handleEdit = () => setIsEditing(true);

  // 取消編輯
  const handleCancel = () => {
    setIsEditing(false);
    // 重新依照初始化邏輯回填 user 資料，確保型別正確
    setFormData({
      account: user.account ?? "",
      mail: user.mail ?? "",
      name: user.name ?? "",
      phone: user.phone ?? "",
      gender_id: user.gender_id != null ? String(user.gender_id) : "",
      year: user.year ?? "",
      month: user.month ?? "",
      date: user.date ?? "",
      city_id: user.city_id ?? "",
      address: user.address ?? "",
      img: user.img ?? "",
      imgPreview: null,
    });
  };

  // 確認更新 - 提交到後端
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("reactLoginToken");
      if (!token) throw new Error("請先登入");

      // 準備表單資料
      const updateData = new FormData();
      for (const key in formData) {
        if (key !== "account" && key !== "mail" && key !== "imgPreview") {
          if (key === "img" && formData.img instanceof File) {
            updateData.append("img", formData.img);
          } else {
            const value =
              formData[key] === undefined || formData[key] === null
                ? ""
                : formData[key];
            updateData.append(key, value);
          }
        }
      }

      // 執行 API 更新請求
      const res = await fetch(
        `${API_URL}/api/users/${formData.account}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: updateData,
        }
      );
      const result = await res.json();
      console.log("更新結果:", result);

      if (result.status === "success") {
        console.log("API 回傳 user:", result.data.user);
        setUser(result.data.user);

        // 更新 formData 以反映服務器的最新狀態
        setFormData({
          account: result.data.user.account ?? "",
          mail: result.data.user.mail ?? "",
          name: result.data.user.name ?? "",
          phone: result.data.user.phone ?? "",
          gender_id:
            result.data.user.gender_id != null
              ? String(result.data.user.gender_id)
              : "",
          year: result.data.user.year ?? "",
          month: result.data.user.month ?? "",
          date: result.data.user.date ?? "",
          city_id: result.data.user.city_id ?? "",
          address: result.data.user.address ?? "",
          img: result.data.user.img ?? "",
          imgPreview: null, // 清除預覽
        });

        setIsEditing(false);
        // alert("個人資料更新成功！");
        await swalSuccess("更新", "個人資料更新成功！");
      } else {
        // alert(result.message || "更新失敗");
        await swalError("更新", result.message || "更新失敗");
      }
    } catch (err) {
      // alert(`更新失敗: ${err.message}`);
      await swalError("更新", `更新失敗: ${err.message}`);
    }
  };

  // 刪除帳號
  const handleDeleteAccount = async () => {
    // if (!window.confirm("確定要刪除帳號嗎？此操作無法復原！")) return;
    const result = await swalConfirm("是否確認要刪除帳號？", undefined, {
      html: `<span style="color:var(--Danger500);font-weight:bold;">警告：此操作無法復原！</span>`,
      confirmButtonText: "確認",
      cancelButtonText: "取消",
      confirmButtonColor: "var(--Danger500)",
      cancelButtonColor: "#4d4d4d",
    });

    // 如果用戶取消，直接返回
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("reactLoginToken");
      // 取得目前帳號
      const account = user?.account;
      if (!account) throw new Error("無法取得帳號");
      // 執行刪除
      const res = await fetch(`${API_URL}/api/users/${account}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (result.status === "success") {
        // alert("帳號已刪除");
        await swalSuccess(user.account, "已成功刪除帳號");
        localStorage.removeItem("reactLoginToken");
        // setUser(null);
        window.location.href = "/";
      } else {
        // alert(result.message || "刪除失敗");
        await swalError("刪除帳號", result.message || "刪除失敗");
      }
    } catch (err) {
      // alert(`刪除失敗: ${err.message}`);
      await swalError("刪除帳號", `刪除失敗: ${err.message}`);
    }
  };

  if (user) {
    return (
      <div>
        <Header />
        <div className="d-flex container mt-4 mb-4">
          <Sidebar />

          <div className="edit-main-content">
            <div className="breadcrumb">
              <Breadcrumb />
            </div>

            <div id="profile-form" className="form-middle">
              <h1 className="mb-0">會員資料管理</h1>
              <form className="align-self-stretch" onSubmit={handleUpdate}>
                <hr className="line" />

                <div className="row mb-3 mb-md-5">
                  <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                    <div
                      className="avatar-wrapper-bg"
                      style={{ cursor: isEditing ? "pointer" : "default" }}
                    >
                      <div className="avatar-bg" onClick={handleImageClick}>
                        <img
                          src={
                            formData.imgPreview
                              ? formData.imgPreview
                              : formData.img && typeof formData.img === "string"
                              ? formData.img.startsWith("http")
                                ? formData.img
                                : `/images/users/user-photo/${formData.img}`
                              : "/images/users/user-photo/user.jpg"
                          }
                          alt="avatar"
                        />
                        {isEditing && (
                          <div className="camera-bg editing">
                            <i className="fa-solid fa-camera"></i>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-12 col-md-6 d-flex flex-column">
                    <div className="mb-3 mb-md-2">
                      <label className="form-label">帳號</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="account"
                          value={formData.account}
                          disabled
                          readOnly
                        />
                      ) : (
                        <div className="input-disabled">
                          {formData.account || ""}
                        </div>
                      )}
                    </div>
                    <div className="mb-3 mb-md-2">
                      <label className="form-label">信箱</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="mail"
                          value={formData.mail}
                          disabled
                          readOnly
                        />
                      ) : (
                        <div className="input-disabled">
                          {formData.mail || ""}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="form-label">使用者名稱</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          placeholder="請輸入使用者名稱"
                          value={formData.name ?? ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <div className="input">
                          {formData.name || (
                            <span style={{ color: "#999" }}>
                              請輸入使用者名稱
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row mb-4 mb-md-5 align-items-end">
                  <div className="col-12 col-md-3">
                    <label className="form-label">電話</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="0912-345678"
                        value={formData.phone ?? ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    ) : (
                      <div className="input">
                        {formData.phone || (
                          <span style={{ color: "#999" }}>0912-345678</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-3">
                    <label htmlFor="radio1" className="form-label d-block">
                      性別
                    </label>
                    {isEditing ? (
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender_id"
                            id="radio1"
                            value="1"
                            checked={formData.gender_id === "1"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="radio1">
                            男性
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender_id"
                            id="radio2"
                            value="2"
                            checked={formData.gender_id === "2"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="radio2">
                            女性
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender_id"
                            id="radio3"
                            value="3"
                            checked={formData.gender_id === "3"}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="radio3">
                            其他
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="input">
                        {formData.gender_id === "1" && "男性"}
                        {formData.gender_id === "2" && "女性"}
                        {formData.gender_id === "3" && "其他"}
                        {!["1", "2", "3"].includes(formData.gender_id) && (
                          <span style={{ color: "#999" }}>請選擇</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="input-birthday" className="form-label">
                      生日
                    </label>
                    <div className="row">
                      <div className="col-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control"
                            id="input-birthday"
                            name="year"
                            placeholder="西元年份"
                            min="1900"
                            max="2025"
                            value={formData.year ?? ""}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                          />
                        ) : (
                          <div className="input">
                            {formData.year || (
                              <span style={{ color: "#999" }}>西元年份</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control"
                            name="month"
                            placeholder="月份"
                            min="1"
                            max="12"
                            value={formData.month ?? ""}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                          />
                        ) : (
                          <div className="input">
                            {formData.month || (
                              <span style={{ color: "#999" }}>月份</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="col-4">
                        {isEditing ? (
                          <input
                            type="number"
                            className="form-control"
                            name="date"
                            placeholder="日期"
                            min="1"
                            max="31"
                            value={formData.date ?? ""}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                          />
                        ) : (
                          <div className="input">
                            {formData.date || (
                              <span style={{ color: "#999" }}>日期</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mb-5">
                  <div className="col-12 col-md-2">
                    <label className="form-label">縣市</label>
                    {isEditing ? (
                      <select
                        className="form-select"
                        name="city_id"
                        value={formData.city_id ?? ""}
                        onChange={handleInputChange}
                      >
                        <option value="" disabled>
                          請選擇
                        </option>
                        <option value="1">台北市</option>
                        <option value="2">新北市</option>
                        <option value="3">桃園市</option>
                        <option value="4">台中市</option>
                        <option value="5">台南市</option>
                        <option value="6">高雄市</option>
                        <option value="7">基隆市</option>
                        <option value="8">新竹市</option>
                        <option value="9">嘉義市</option>
                        <option value="10">新竹縣</option>
                        <option value="11">苗栗縣</option>
                        <option value="12">彰化縣</option>
                        <option value="13">南投縣</option>
                        <option value="14">雲林縣</option>
                        <option value="15">嘉義縣</option>
                        <option value="16">屏東縣</option>
                        <option value="17">宜蘭縣</option>
                        <option value="18">花蓮縣</option>
                        <option value="19">台東縣</option>
                        <option value="20">澎湖縣</option>
                        <option value="21">金門縣</option>
                        <option value="22">連江縣</option>
                      </select>
                    ) : (
                      <div className="input">
                        {(() => {
                          const cityMap = {
                            1: "台北市",
                            2: "新北市",
                            3: "桃園市",
                            4: "台中市",
                            5: "台南市",
                            6: "高雄市",
                            7: "基隆市",
                            8: "新竹市",
                            9: "嘉義市",
                            10: "新竹縣",
                            11: "苗栗縣",
                            12: "彰化縣",
                            13: "南投縣",
                            14: "雲林縣",
                            15: "嘉義縣",
                            16: "屏東縣",
                            17: "宜蘭縣",
                            18: "花蓮縣",
                            19: "台東縣",
                            20: "澎湖縣",
                            21: "金門縣",
                            22: "連江縣",
                          };
                          return (
                            cityMap[formData.city_id] || (
                              <span style={{ color: "#999" }}>請選擇</span>
                            )
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-10">
                    <label className="form-label">地址</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        placeholder="請輸入地址"
                        value={formData.address ?? ""}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                      />
                    ) : (
                      <div className="input">
                        {formData.address || (
                          <span style={{ color: "#999" }}>請輸入地址</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <hr className="mb-5" />

                <div className="text-center">
                  {!isEditing && (
                    <>
                      <a
                        className="btn btn-password me-5"
                        onClick={() =>
                          (window.location.href = "/user/change-password")
                        }
                      >
                        <i className="fa-solid fa-key me-1"></i>變更密碼
                      </a>
                      <button
                        type="button"
                        className="btn btn-edit me-5"
                        onClick={handleEdit}
                      >
                        <i className="fa-solid fa-pen-to-square me-1"></i>{" "}
                        編輯資料
                      </button>
                      <button
                        type="button"
                        className="btn btn-del"
                        onClick={handleDeleteAccount}
                      >
                        <i className="fa-solid fa-trash me-1"></i> 刪除帳號
                      </button>
                    </>
                  )}
                  {isEditing && (
                    <>
                      <button
                        type="submit"
                        className="btn btn-success me-5"
                        disabled={isLoading}
                      >
                        <i className="fa-solid fa-check me-2"></i>
                        更新
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary me-5"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <i className="fa-solid fa-times me-1"></i> 取消
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
