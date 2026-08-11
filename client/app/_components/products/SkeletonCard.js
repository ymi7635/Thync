// 商品卡片載入中的骨架屏佔位元件
export default function SkeletonCard() {
  return (
    <div className="product-card skeleton">
      <div className="skeleton-img" />
      <div className="skeleton-title" />
      <div className="skeleton-price" />
    </div>
  );
}