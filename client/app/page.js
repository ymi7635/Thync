"use client";
// 網站首頁
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/index.css";
import Header from "./_components/header";
import Footer from "./_components/footer";
import ArticleCard from "./_components/articleCard";

import EventCard from "./_components/eventCard";
import { API_URL } from "@/utils/api";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [showHeader, setShowHeader] = useState(false);



  const topImgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (topImgRef.current) {
        const rect = topImgRef.current.getBoundingClientRect();
        setShowHeader(rect.bottom < rect.height / 1.5);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // 文章資料 state
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(null);

  useEffect(() => {
    setArticlesLoading(true);
    fetch(`${API_URL}/api/articles?limit=6`)
      .then(res => res.json())
      .then(data => {
        setArticles(data?.data?.articles || []);
        setArticlesLoading(false);
      })
      .catch(err => {
        setArticlesError(err.message);
        setArticlesLoading(false);
      });
  }, []);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const eventData = [
    {
      image: "/images/index/event1.png",
      description:
        "【劃破天際 ‧ 快上加快】7/25-8/24買最新ROG Strix系列路由器就送ROG Cat7 10G網路線",
      time: "2025/07/25 - 2025/08/24",
    },
    {
      image: "/images/index/event2.png",
      description:
        "7/19 ~ 7/27 暑期年中慶活動！購買 EIZO系列螢幕就送您 7-11 禮卷，時間有限送完為止！",
      time: "2025/07/19 - 2025/07/27",
    },
    {
      image: "/images/index/event3.png",
      description:
        "2025/07/10 - 2025/09/30 購買指定 QD-OLED電競螢幕 登錄送 「《明末：淵虛之羽》遊戲序號」",
      time: "2025/07/10 - 2025/09/30",
    },
    {
      image: "/images/index/event4.png",
      description:
        "2025/7/1~2025/9/30 盛夏暢玩 超值購!活動期間購買 MSI 指定產品，登錄送蒸氣卡，最高 NT$3,500 元！",
      time: "2025/07/01 - 2025/09/30",
    },
    {
      image: "/images/index/event5.png",
      description:
        "德國音響品牌Sennheiser 隆重宣佈其獲獎耳機MOMENTUM 4 Wireless推出80週年紀念版",
      time: "2025/07/14",
    },
    {
      image: "/images/index/event6.png",
      description:
        "2025/01/01起官網訂購FLICO鍵盤、贈送活動贈品。精彩優惠不要錯過！",
      time: "2025/01/01 - 2025/12/31",
    },
  ];

  return (
    <>
      {isMobile ? (
        // 手機版結構
        <header>
            <Header />
        </header>
      ) : (
        // 桌機版結構
        <header>
          <div className="TOP">
            <img
              src="/images/LOGO.png"
              alt="Large Logo"
              className="img-fluid"
            />
            <h3>Think what hearts can see
              Sync where minds run free</h3>
          </div>
          <video
            src="/IwannaCRY.mp4"
            className="img-fluid"
            ref={topImgRef}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "auto", objectFit: "cover", filter: "brightness(0.)" }}
          />
          <div className={`${showHeader ? "showheader" : "fade"} `}>
            <Header />
          </div>
        </header>
      )}

      <section id="products">
        <h1 className="sectionName">Products</h1>
        <div className="container">
          <h4 className="sectionSubtitle">
            ──“Select your vibe, link your tribe.”
          </h4>
        </div>
        <div className="p-cards">
          <div className="row">
            <a className="col keyboard" href="/products?mid=1">
              <h1>KEYBOARD</h1>
            </a>
            <a className="col monitor" href="/products?mid=5">
              <h1>MONITOR</h1>
            </a>
          </div>
          <div className="row">
            <a className="col mouse" href="/products?mid=2">
              <h1>MOUSE</h1>
            </a>
            <a className="col audio" href="/products?mid=3">
              <h1>AUDIO</h1>
            </a>
            <a className="col case" href="/products?mid=4">
              <h1>CASE</h1>
            </a>
          </div>
        </div>
      </section>

      <section id="marquee">
        <div className="marquee-content">
          <img src="/images/index/carousels (1).png" alt="slide1" />
          <img src="/images/index/carousels (2).png" alt="slide2" />
          <img src="/images/index/carousels (3).png" alt="slide3" />
          <img src="/images/index/carousels (4).png" alt="slide4" />
          <img src="/images/index/carousels (5).png" alt="slide5" />
          <img src="/images/index/carousels (6).png" alt="slide6" />
          <img src="/images/index/carousels (7).png" alt="slide7" />
          <img src="/images/index/carousels (1).png" alt="slide1" />
          <img src="/images/index/carousels (2).png" alt="slide2" />
          <img src="/images/index/carousels (3).png" alt="slide3" />
          <img src="/images/index/carousels (4).png" alt="slide4" />
          <img src="/images/index/carousels (5).png" alt="slide5" />
          <img src="/images/index/carousels (6).png" alt="slide6" />
          <img src="/images/index/carousels (7).png" alt="slide7" />
        </div>
      </section>

      <section id="articles">
        <h1 className="sectionName">Articles</h1>
        <div className="container">
          <h4 className="sectionSubtitle">
            ──“Skim for the traces, dive for the basis.”
          </h4>
        </div>
        <div className="container ">
          <div className="a-cards">
            <div className="row">
              {articles.map(article => (
                <div className="col" key={article.id}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="events">
        <h1 className="sectionName">Events</h1>
        <div className="container">
          <h4 className="sectionSubtitle">
            ──“Freshly dropped, sharply locked.”
          </h4>
        </div>
        <div className="container">
          <div className="e-cards">
            <div className="row">
              {eventData.map((data, index) => (
                <div className="col" key={index + 1}>
                  <EventCard key={index} {...data} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
