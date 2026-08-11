// 優惠券頁用的單張優惠券卡片元件
export default function CouponCard({
  type,
  name,
  description,
  expireDate,
  status, // 新增
}) {
  return (
    <div className={`coupon-card ${status}`}>
      <div className="top">
        <div className="type">{type}</div>
        <div className="name">{name}</div>
        <div className="desc">{description}</div>
      </div>

      <div className="bottom">
        <div className="expire">{expireDate}</div>
        {status === "usable" && (
          <span className="status-label usable">可使用</span>
        )}
        {status === "used" && <span className="status-label used">已使用</span>}
        {status === "expired" && (
          <span className="status-label expired">已過期</span>
        )}
      </div>
    </div>
  );
}
