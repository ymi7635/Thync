// 購物車金額小計卡片（商品總額、折扣、運費、應付金額）
import "./cart.css";
import { useState } from "react";

export default function CartSummary({
  items,
  discount = 0,
  coupon = null,
  onCheckout,
}) {
  console.log("coupon type:", coupon?.type, typeof coupon?.type);
  // 狀態管理
  const [payType, setPayType] = useState("取貨付款");
  const [shippingType, setShippingType] = useState("超商取貨");
  const [payOpen, setPayOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  // 計算總計、運費、件數
  const safeItems = Array.isArray(items) ? items : [];
  const count = safeItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = safeItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  // 預設運費
  let baseShipping = shippingType === "宅配到府" ? 80 : 60;
  let shipping = baseShipping;

  // 如果優惠券是免運券 → 不動運費顯示，但折扣多加運費
  let finalDiscount = discount;
  if (coupon?.type === "free_shipping") {
    finalDiscount += baseShipping;
  }

  // 總額計算
  const total = subtotal + baseShipping - finalDiscount;

  const handleCheckout = () => {
    const checkoutForm = {
      payType,
      shippingType,
    };

    // ✅ 把 finalDiscount 存進 localStorage
    localStorage.setItem("discount", finalDiscount);

    localStorage.setItem("checkoutForm", JSON.stringify(checkoutForm));
    if (onCheckout) onCheckout();
  };

  return (
    <div className="cart-summary">
      <h3>結帳明細</h3>
      <div className="summarycontainer">
        <ul>
          <li>
            <span>付款方式</span>
            <div className={`custom-select${payOpen ? " is-open" : ""}`}>
              <button
                className="cs-trigger"
                aria-expanded={payOpen}
                onClick={() => setPayOpen((open) => !open)}
              >
                <span className="cs-text">{payType}</span>
              </button>
              <ul className="cs-menu">
                <li
                  className={`cs-option${
                    payType === "取貨付款" ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setPayType("取貨付款");
                    setPayOpen(false);
                  }}
                >
                  取貨付款
                </li>
                <li
                  className={`cs-option${
                    payType === "ECPay付款" ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setPayType("ECPay付款");
                    setPayOpen(false);
                  }}
                >
                  ECPay付款
                </li>

                {/* 寫不完就刪掉
                <li
                  className={`cs-option${payType === "Line Pay" ? " is-selected" : ""}`}
                  onClick={() => { setPayType("Line Pay"); setPayOpen(false); }}
                >Line Pay</li> */}
              </ul>
            </div>
          </li>

          <li>
            <span>運送方式</span>
            <div className={`custom-select${shippingOpen ? " is-open" : ""}`}>
              <button
                className="cs-trigger"
                aria-expanded={shippingOpen}
                onClick={() => setShippingOpen((open) => !open)}
              >
                <span className="cs-text">{shippingType}</span>
              </button>
              <ul className="cs-menu">
                <li
                  className={`cs-option${
                    shippingType === "超商取貨" ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setShippingType("超商取貨");
                    setShippingOpen(false);
                  }}
                >
                  超商取貨
                </li>
                <li
                  className={`cs-option${
                    shippingType === "宅配到府" ? " is-selected" : ""
                  }`}
                  onClick={() => {
                    setShippingType("宅配到府");
                    setShippingOpen(false);
                  }}
                >
                  宅配到府
                </li>
              </ul>
            </div>
          </li>
          <li>
            商品總額 <span>${subtotal}</span>
          </li>
          <li>
            運費總額 <span>${baseShipping}</span>
          </li>
          <li className="total">
            <span className="label">統計</span>
            <div className="right">
              <span>共 {count} 件</span>
              <div className="row">
                <span>折扣 -${finalDiscount}</span>
              </div>
            </div>
          </li>
          <li>
            總付款額 <span className="fs-4 fw-bold ms-auto">${total}</span>
          </li>
        </ul>
        <button className="btn-checkout" onClick={handleCheckout}>
          結帳 ({count})
        </button>
      </div>
    </div>
  );
}
