"use client";
// 首頁活動/宣傳圖卡片元件
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

export default function EventCard({ image, description, time }) {
  return (
    <>
      <img src={image} alt="Event Image" className="image" />
      <div className="content">
        <p className="description">{description}</p>
        <div className="d-flex align-items-center timeBox justify-content-end">
          <FontAwesomeIcon icon={faClock} className="me-1" />
          <p className="time m-0">{time}</p>
        </div>
      </div>
    </>
  )
}