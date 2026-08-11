// CartCouponArea 用的單張優惠券卡片元件
export default function CouponCard({
  type,
  name,
  description,
  amount,
  expireDate,
  isActive,
  isDisabled,
  onClick,
}) {
  return (
    <div
      className={`coupon-scroll-card ${isActive ? "active" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
      onClick={!isDisabled ? onClick : undefined}
    >
      {isActive && <div className="coupon-stamp-circle">已選擇</div>}
      <div className="top">
        <div className="type">{type}</div>
        <div className="desc">{description}</div>
        <div className="name">{name}</div>
        <div className="amount">{amount}</div>
      </div>

      <div className="bottom">
        <div className="expire">{expireDate}</div>
      </div>
    </div>
  );
}
