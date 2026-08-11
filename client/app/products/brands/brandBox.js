// 品牌列表頁的品牌區塊（依英文字母分組）
import { brandData } from "./brandsData";
import Link from "next/link";

export default function BrandBox() {
  return (
    <>
      <div className="brand-index">
        {Object.keys(brandData).map(letter => (
          <a key={letter} href={`#block-${letter}`} className="brand-index-link">
            {letter}
          </a>
        ))}
      </div>

      {Object.entries(brandData).map(([letter, items]) => (

        <div key={letter} id={`block-${letter}`} className="brand-row">
          <div className="brand-letter">{letter}</div>
          <div className="brand-items">

            {items.map((brand, idx) => (
              <Link key={brand.bid} className="brand-link" href={`/products?brand_id=${brand.bid}`}>
                <div key={idx} className="brand-item">
                  <div className="brand-img">
                    <img src={brand.logo} alt={brand.name} />
                  </div>
                  <p>{brand.name}</p>
                </div>
              </Link>
            ))}


          </div>
        </div>
      ))}
    </>


  );
}
