"use client"
// 商品列表頁左側篩選側欄（分類/屬性/價格區間）

import style from '@/styles/products.css'
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function Sidebar({
  categories,
  filteredSubs,
  filteredAttrs,
  mid,
  cid,
  brands,
  options,
  setOptions,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  MainChange,
  SubChange,
  BrandChange,
  OptionChange,
  PriceChange,
  ClearFilters   // ⭐ 新增
}) {

  const [openMain, setOpenMain] = useState(null)
  const [brandExpanded, setBrandExpanded] = useState(false)

  const toggleMain = (id) => {
    setOpenMain(openMain === id ? null : id) // 如果點同一個就收合
    MainChange({ target: { value: id } }) // 順便篩選
  }

  useEffect(() => {
    if (mid) {
      setOpenMain(Number(mid))  // 根據網址的 mid 預設展開
    }
  }, [mid])


  return (
    <aside>
      <div className='title-area'>
        <h6>所有商品</h6>
      </div>
      {/* 母分類 + 子分類 (Bootstrap Collapse) */}
      <div className='category'>
        {categories.main.map((main) => (
          <div key={main.id}>
            <div
              className={`btn btn-link main-btn ${mid === String(main.id) ? "active" : ""}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapseMain${main.id}`}
              aria-expanded={mid === String(main.id) ? "true" : "false"}
              // 點母分類 → 篩選 & 展開
              onClick={() => toggleMain(main.id)}
            >
              {main.name}
              <span>{openMain === main.id ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />}</span>
            </div>

            <div
              id={`collapseMain${main.id}`}
              className={`collapse ${mid === String(main.id) ? "show" : ""}`}
            >
              <div className="list-group">
                {categories.sub
                  .filter((s) => s.main_id == main.id)
                  .map((sub) => (
                    <button
                      key={sub.id}
                      className={`list-group-item list-group-item-action ${cid === String(sub.id) ? "active" : ""
                        }`}
                      value={sub.id}
                      onClick={(e) =>
                        SubChange({ target: { value: sub.id } })
                      }
                    >
                      {sub.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 品牌 */}
      <div className="brand-area">
        <h6>品牌</h6>
        {categories.brand.slice(0, 6).map((c) => (
          <div key={c.id} className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`brand-${c.id}`}   // 每個 checkbox 需要唯一 id
              value={c.id}
              checked={brands.includes(String(c.id))}
              onChange={BrandChange}
            />
            <label className="form-check-label" htmlFor={`brand-${c.id}`}>
              {c.name}
            </label>
          </div>
        ))}

        {/* 收合區域 */}
        <div className="collapse" id="moreBrands">
          {categories.brand.slice(6).map((c) => (
            <label key={c.id} className="form-check-label">
              <input
                className="form-check-input"
                type="checkbox"
                value={c.id}
                checked={brands.includes(String(c.id))}
                onChange={BrandChange}
              />
              {c.name}
            </label>
          ))}
        </div>

        {/* 切換按鈕 */}
        {categories.brand.length > 10 && (
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
        {filteredAttrs.map(attr => (
          <div
            className='select-group'
            key={attr.id} >
            <strong>{attr.name}</strong>
            <select
              className="form-select"
              value={options.find(id => attr.options.some(opt => String(opt.id) === id)) || ""}
              onChange={e => {
                const value = e.target.value
                let newOptions = [...options]

                // 先把同一個屬性的舊選項移除
                newOptions = newOptions.filter(id => !attr.options.some(opt => String(opt.id) === id))

                // 如果有新值就加進去
                if (value) {
                  newOptions.push(value)
                }

                // 更新狀態
                setOptions(newOptions)

                // 更新 URL
                const params = new URLSearchParams(window.location.search)
                if (newOptions.length > 0) {
                  params.set("options", newOptions.join(","))
                } else {
                  params.delete("options")
                }
                window.history.pushState({}, "", `?${params.toString()}`)
              }}
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


        {/* 價格區間 */}
        <div>
          <strong>價格區間</strong>
          <div className="mt-2 mx-2">
            {/* 雙滑桿 */}
            <Slider
              range
              min={0}
              max={69900}
              step={100}
              value={[Number(priceMin) || 0, Number(priceMax) || 69900]}
              onChange={(vals) => {
                setPriceMin(vals[0]);
                setPriceMax(vals[1]);
              }}
              styles={{
                track: { backgroundColor: "var(--Primary100)", height: 4 },
                handle: {
                  borderColor: "var(--Primary300)",
                  backgroundColor: "var(--Primary300)",
                  width: 20,
                  height: 20,
                  marginTop: -8,
                  opacity:1,
                },
                rail: { backgroundColor: "#ddd", height: 4 }
              }}
            />

            {/* 輸入框 */}
            <div className="d-flex align-items-center justify-content-between mt-3">
              <input
                type="number"
                className="form-control w-100"
                placeholder="最低價"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className='mx-2'>—</span>
              <input
                type="number"
                className="form-control w-100"
                placeholder="最高價"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>

            {/* 按鈕 */}
            <div className="mt-3 d-flex gap-2">
              <button className="btn filterBtn " onClick={PriceChange}>
                套用篩選
              </button>
              <button className="btn filterBtn ms-auto" onClick={ClearFilters}>
                清除篩選
              </button>
            </div>
          </div>
        </div>
      </div>

    </aside>
  )
}
