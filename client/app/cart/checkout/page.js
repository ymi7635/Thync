"use client";
// 購物車結帳頁：填寫收件資訊、選擇物流付款方式

import { useEffect, useState } from "react";
import CartHeader from "@/app/_components/cart/cartHeader";
import CartSteps from "@/app/_components/cart/cartSteps";
import RecommendList from "@/app/_components/cart/recommendList";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import { useShip711StoreOpener } from "@/hooks/use-ship-711-store";
import "./checkout.css";
import "@/app/_components/cart/cartShared.css";

export default function CheckoutPage() {
  // 門市資訊顯示狀態
  const { store711, openWindow } = useShip711StoreOpener(
    "http://localhost:3000/cart/ship/api"
  );
  const [mobileCarrier, setMobileCarrier] = useState("");

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    address: "",
  });

  function validateForm(form, mobileCarrier) {
    // 姓名：2~20 個中文字或英文
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/;

    // 手機號碼：台灣 09 開頭共 10 碼
    const phoneRegex = /^09\d{8}$/;

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 郵遞區號：3 或 5 碼數字
    const zipRegex = /^\d{3,5}$/;

    // 手機載具：/ 開頭 + 7 碼大寫英數字
    const carrierRegex = /^\/[A-Z0-9]{7}$/;

    if (!nameRegex.test(form.receiverName)) {
      alert("收件人姓名格式錯誤，請輸入中文或英文 2~20 字。");
      return false;
    }
    if (!phoneRegex.test(form.receiverPhone)) {
      alert("收件人手機號碼格式錯誤，請輸入 09 開頭的 10 碼數字。");
      return false;
    }
    if (!emailRegex.test(form.receiverEmail)) {
      alert("收件人 Email 格式錯誤。");
      return false;
    }
    if (form.shippingType === "宅配到府") {
      if (!zipRegex.test(form.receiverZip)) {
        alert("郵遞區號格式錯誤，請輸入 3~5 碼數字。");
        return false;
      }
      if (!form.receiverAddress.trim()) {
        alert("請填寫收件地址。");
        return false;
      }
    }
    if (!nameRegex.test(form.buyerName)) {
      alert("購買人姓名格式錯誤，請輸入中文或英文 2~20 字。");
      return false;
    }
    if (!phoneRegex.test(form.buyerPhone)) {
      alert("購買人手機號碼格式錯誤，請輸入 09 開頭的 10 碼數字。");
      return false;
    }
    if (!emailRegex.test(form.buyerEmail)) {
      alert("購買人 Email 格式錯誤。");
      return false;
    }
    if (form.invoiceType === "手機載具") {
      if (!carrierRegex.test(mobileCarrier)) {
        alert("手機載具格式錯誤，必須為 / 開頭 + 7 碼大寫英數字。");
        return false;
      }
    }

    return true;
  }

  // 同步訂購人資訊到會員資料
  const [syncMember, setSyncMember] = useState(false);
  // 預設值
  // page.js 裡 CheckoutPage component 最上面
  const [form, setForm] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverCity: "",
    receiverDistrict: "",
    receiverZip: "",
    receiverAddress: "",
    deliveryTime: "",
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    shippingType: "宅配到府", // 預設值
    payType: "信用卡一次付清", // 預設值
    invoiceType: "會員載具", // 預設值
    storeName: "",
    storeAddress: "",
  });

  useEffect(() => {
    const data = localStorage.getItem("checkoutForm");
    if (data) {
      const saved = JSON.parse(data);
      setForm((prev) => ({
        ...prev,
        ...saved, // 這裡就會帶入 payType、shippingType
      }));
    } else {
      setForm({
        receiverName: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverCity: "",
        receiverDistrict: "",
        receiverZip: "",
        receiverAddress: "",
        deliveryTime: "",
        buyerName: "",
        buyerPhone: "",
        buyerEmail: "",
        shippingType: "宅配到府", // 預設值
        payType: "信用卡一次付清", // 預設值
        invoiceType: "會員載具",
      });
    }
  }, []);

  const cities = [
    "請選擇縣市",
    "台北市",
    "新北市",
    "桃園市",
    "台中市",
    "台南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "嘉義市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "台東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
  ];
  const districts = {
    台北市: [
      "請選擇鄉鎮市區",
      "中正區",
      "大同區",
      "中山區",
      "松山區",
      "大安區",
      "萬華區",
      "信義區",
      "士林區",
      "北投區",
      "內湖區",
      "南港區",
      "文山區",
    ],
    新北市: [
      "請選擇鄉鎮市區",
      "板橋區",
      "新莊區",
      "中和區",
      "永和區",
      "土城區",
      "樹林區",
      "三峽區",
      "鶯歌區",
      "三重區",
      "蘆洲區",
      "五股區",
      "泰山區",
      "林口區",
      "八里區",
      "淡水區",
      "三芝區",
      "石門區",
      "金山區",
      "萬里區",
      "汐止區",
      "瑞芳區",
      "貢寮區",
      "雙溪區",
      "坪林區",
      "烏來區",
    ],
    桃園市: [
      "請選擇鄉鎮市區",
      "桃園區",
      "中壢區",
      "平鎮區",
      "八德區",
      "楊梅區",
      "蘆竹區",
      "大溪區",
      "大園區",
      "龜山區",
      "龍潭區",
      "新屋區",
      "觀音區",
      "復興區",
    ],
    台中市: [
      "請選擇鄉鎮市區",
      "中區",
      "東區",
      "南區",
      "西區",
      "北區",
      "北屯區",
      "西屯區",
      "南屯區",
      "太平區",
      "大里區",
      "霧峰區",
      "烏日區",
      "豐原區",
      "后里區",
      "石岡區",
      "東勢區",
      "和平區",
      "新社區",
      "潭子區",
      "大雅區",
      "神岡區",
      "大肚區",
      "沙鹿區",
      "龍井區",
      "梧棲區",
      "清水區",
      "大甲區",
      "外埔區",
      "大安區",
    ],
    台南市: [
      "請選擇鄉鎮市區",
      "中西區",
      "東區",
      "南區",
      "北區",
      "安平區",
      "安南區",
      "永康區",
      "歸仁區",
      "新化區",
      "左鎮區",
      "玉井區",
      "楠西區",
      "南化區",
      "仁德區",
      "關廟區",
      "龍崎區",
      "官田區",
      "麻豆區",
      "佳里區",
      "西港區",
      "七股區",
      "將軍區",
      "學甲區",
      "北門區",
      "新營區",
      "後壁區",
      "白河區",
      "東山區",
      "六甲區",
      "下營區",
      "柳營區",
      "鹽水區",
      "善化區",
      "大內區",
      "山上區",
      "新市區",
      "安定區",
    ],
    高雄市: [
      "請選擇鄉鎮市區",
      "新興區",
      "前金區",
      "苓雅區",
      "鹽埕區",
      "鼓山區",
      "旗津區",
      "前鎮區",
      "三民區",
      "楠梓區",
      "小港區",
      "左營區",
      "仁武區",
      "大社區",
      "東沙群島",
      "南沙群島",
      "岡山區",
      "路竹區",
      "阿蓮區",
      "田寮區",
      "燕巢區",
      "橋頭區",
      "梓官區",
      "彌陀區",
      "永安區",
      "湖內區",
      "鳳山區",
      "大寮區",
      "林園區",
      "鳥松區",
      "大樹區",
      "旗山區",
      "美濃區",
      "六龜區",
      "甲仙區",
      "杉林區",
      "內門區",
      "茂林區",
      "桃源區",
      "那瑪夏區",
    ],
    基隆市: [
      "請選擇鄉鎮市區",
      "仁愛區",
      "信義區",
      "中正區",
      "中山區",
      "安樂區",
      "暖暖區",
      "七堵區",
    ],
    新竹市: ["請選擇鄉鎮市區", "東區", "北區", "香山區"],
    嘉義市: ["請選擇鄉鎮市區", "東區", "西區"],
    新竹縣: [
      "請選擇鄉鎮市區",
      "竹北市",
      "竹東鎮",
      "新埔鎮",
      "關西鎮",
      "湖口鄉",
      "新豐鄉",
      "芎林鄉",
      "橫山鄉",
      "北埔鄉",
      "寶山鄉",
      "峨眉鄉",
      "尖石鄉",
      "五峰鄉",
    ],
    苗栗縣: [
      "請選擇鄉鎮市區",
      "苗栗市",
      "頭份市",
      "苑裡鎮",
      "通霄鎮",
      "竹南鎮",
      "後龍鎮",
      "卓蘭鎮",
      "西湖鄉",
      "頭屋鄉",
      "公館鄉",
      "銅鑼鄉",
      "三義鄉",
      "造橋鄉",
      "三灣鄉",
      "南庄鄉",
      "大湖鄉",
      "獅潭鄉",
      "泰安鄉",
    ],
    彰化縣: [
      "請選擇鄉鎮市區",
      "彰化市",
      "員林市",
      "和美鎮",
      "鹿港鎮",
      "溪湖鎮",
      "二林鎮",
      "田中鎮",
      "北斗鎮",
      "花壇鄉",
      "芬園鄉",
      "大村鄉",
      "永靖鄉",
      "伸港鄉",
      "線西鄉",
      "福興鄉",
      "秀水鄉",
      "埔心鄉",
      "埔鹽鄉",
      "大城鄉",
      "芳苑鄉",
      "竹塘鄉",
      "社頭鄉",
      "二水鄉",
      "田尾鄉",
      "埤頭鄉",
    ],
    南投縣: [
      "請選擇鄉鎮市區",
      "南投市",
      "草屯鎮",
      "竹山鎮",
      "集集鎮",
      "名間鄉",
      "鹿谷鄉",
      "中寮鄉",
      "魚池鄉",
      "國姓鄉",
      "水里鄉",
      "信義鄉",
      "仁愛鄉",
    ],
    雲林縣: [
      "請選擇鄉鎮市區",
      "斗六市",
      "斗南鎮",
      "虎尾鎮",
      "西螺鎮",
      "土庫鎮",
      "北港鎮",
      "莿桐鄉",
      "林內鄉",
      "二崙鄉",
      "崙背鄉",
      "麥寮鄉",
      "東勢鄉",
      "褒忠鄉",
      "台西鄉",
      "元長鄉",
      "四湖鄉",
      "口湖鄉",
      "水林鄉",
    ],
    嘉義縣: [
      "請選擇鄉鎮市區",
      "太保市",
      "朴子市",
      "布袋鎮",
      "大林鎮",
      "民雄鄉",
      "溪口鄉",
      "新港鄉",
      "六腳鄉",
      "東石鄉",
      "義竹鄉",
      "鹿草鄉",
      "水上鄉",
      "中埔鄉",
      "竹崎鄉",
      "梅山鄉",
      "番路鄉",
      "大埔鄉",
      "阿里山鄉",
    ],
    屏東縣: [
      "請選擇鄉鎮市區",
      "屏東市",
      "潮州鎮",
      "東港鎮",
      "恆春鎮",
      "萬丹鄉",
      "長治鄉",
      "麟洛鄉",
      "九如鄉",
      "里港鄉",
      "鹽埔鄉",
      "高樹鄉",
      "萬巒鄉",
      "內埔鄉",
      "竹田鄉",
      "新埤鄉",
      "枋寮鄉",
      "枋山鄉",
      "三地門鄉",
      "瑪家鄉",
      "泰武鄉",
      "來義鄉",
      "春日鄉",
      "獅子鄉",
      "牡丹鄉",
      "車城鄉",
      "滿州鄉",
    ],
    宜蘭縣: [
      "請選擇鄉鎮市區",
      "宜蘭市",
      "羅東鎮",
      "蘇澳鎮",
      "頭城鎮",
      "礁溪鄉",
      "壯圍鄉",
      "員山鄉",
      "冬山鄉",
      "五結鄉",
      "三星鄉",
      "大同鄉",
      "南澳鄉",
    ],
    花蓮縣: [
      "請選擇鄉鎮市區",
      "花蓮市",
      "鳳林鎮",
      "玉里鎮",
      "新城鄉",
      "吉安鄉",
      "壽豐鄉",
      "光復鄉",
      "豐濱鄉",
      "瑞穗鄉",
      "富里鄉",
      "秀林鄉",
      "萬榮鄉",
      "卓溪鄉",
    ],
    台東縣: [
      "請選擇鄉鎮市區",
      "台東市",
      "成功鎮",
      "關山鎮",
      "卑南鄉",
      "鹿野鄉",
      "池上鄉",
      "東河鄉",
      "長濱鄉",
      "太麻里鄉",
      "大武鄉",
      "綠島鄉",
      "海端鄉",
      "延平鄉",
      "金峰鄉",
      "達仁鄉",
      "蘭嶼鄉",
    ],
    澎湖縣: [
      "請選擇鄉鎮市區",
      "馬公市",
      "湖西鄉",
      "白沙鄉",
      "西嶼鄉",
      "望安鄉",
      "七美鄉",
    ],
    金門縣: [
      "請選擇鄉鎮市區",
      "金城鎮",
      "金湖鎮",
      "金沙鎮",
      "金寧鄉",
      "烈嶼鄉",
      "烏坵鄉",
    ],
    連江縣: ["請選擇鄉鎮市區", "南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"],
  };
  const zips = {
    // 台北市
    中正區: "100",
    大同區: "103",
    中山區: "104",
    松山區: "105",
    大安區: "106",
    萬華區: "108",
    信義區: "110",
    士林區: "111",
    北投區: "112",
    內湖區: "114",
    南港區: "115",
    文山區: "116",

    // 新北市
    萬里區: "207",
    金山區: "208",
    板橋區: "220",
    汐止區: "221",
    深坑區: "222",
    石碇區: "223",
    瑞芳區: "224",
    平溪區: "226",
    雙溪區: "227",
    貢寮區: "228",
    新店區: "231",
    坪林區: "232",
    烏來區: "233",
    永和區: "234",
    中和區: "235",
    土城區: "236",
    三峽區: "237",
    樹林區: "238",
    鶯歌區: "239",
    三重區: "241",
    新莊區: "242",
    泰山區: "243",
    林口區: "244",
    蘆洲區: "247",
    五股區: "248",
    八里區: "249",
    淡水區: "251",
    三芝區: "252",
    石門區: "253",

    // 桃園市
    中壢區: "320",
    平鎮區: "324",
    龍潭區: "325",
    楊梅區: "326",
    新屋區: "327",
    觀音區: "328",
    桃園區: "330",
    龜山區: "333",
    八德區: "334",
    大溪區: "335",
    復興區: "336",
    大園區: "337",
    蘆竹區: "338",

    // 台中市
    中區: "400",
    東區: "401",
    南區: "402",
    西區: "403",
    北區: "404",
    北屯區: "406",
    西屯區: "407",
    南屯區: "408",
    太平區: "411",
    大里區: "412",
    霧峰區: "413",
    烏日區: "414",
    豐原區: "420",
    后里區: "421",
    石岡區: "422",
    東勢區: "423",
    和平區: "424",
    新社區: "426",
    潭子區: "427",
    大雅區: "428",
    神岡區: "429",
    大肚區: "432",
    沙鹿區: "433",
    龍井區: "434",
    梧棲區: "435",
    清水區: "436",
    大甲區: "437",
    外埔區: "438",
    大安區: "439",

    // 台南市
    中西區: "700",
    東區: "701",
    南區: "702",
    北區: "704",
    安平區: "708",
    安南區: "709",
    永康區: "710",
    歸仁區: "711",
    新化區: "712",
    左鎮區: "713",
    玉井區: "714",
    楠西區: "715",
    南化區: "716",
    仁德區: "717",
    關廟區: "718",
    龍崎區: "719",
    官田區: "720",
    麻豆區: "721",
    佳里區: "722",
    西港區: "723",
    七股區: "724",
    將軍區: "725",
    學甲區: "726",
    北門區: "727",
    新營區: "730",
    後壁區: "731",
    白河區: "732",
    東山區: "733",
    六甲區: "734",
    下營區: "735",
    柳營區: "736",
    鹽水區: "737",
    善化區: "741",
    大內區: "742",
    山上區: "743",
    新市區: "744",
    安定區: "745",

    // 高雄市
    新興區: "800",
    前金區: "801",
    苓雅區: "802",
    鹽埕區: "803",
    鼓山區: "804",
    旗津區: "805",
    前鎮區: "806",
    三民區: "807",
    楠梓區: "811",
    小港區: "812",
    左營區: "813",
    仁武區: "814",
    大社區: "815",
    岡山區: "820",
    路竹區: "821",
    阿蓮區: "822",
    田寮區: "823",
    燕巢區: "824",
    橋頭區: "825",
    梓官區: "826",
    彌陀區: "827",
    永安區: "828",
    湖內區: "829",
    鳳山區: "830",
    大寮區: "831",
    林園區: "832",
    鳥松區: "833",
    大樹區: "840",
    旗山區: "842",
    美濃區: "843",
    六龜區: "844",
    甲仙區: "845",
    杉林區: "846",
    內門區: "847",
    茂林區: "851",
    桃源區: "848",
    那瑪夏區: "849",

    // 基隆市
    仁愛區: "200",
    信義區: "201",
    中正區: "202",
    中山區: "203",
    安樂區: "204",
    暖暖區: "205",
    七堵區: "206",

    // 宜蘭縣
    宜蘭市: "260",
    頭城鎮: "261",
    礁溪鄉: "262",
    壯圍鄉: "263",
    員山鄉: "264",
    羅東鎮: "265",
    三星鄉: "266",
    大同鄉: "267",
    五結鄉: "268",
    冬山鄉: "269",
    蘇澳鎮: "270",
    南澳鄉: "272",
    釣魚台列嶼: "290",

    // 新竹市
    東區: "300",
    北區: "300",
    香山區: "300",

    // 嘉義市
    東區: "600",
    西區: "600",

    // 新竹縣
    竹北市: "302",
    湖口鄉: "303",
    新豐鄉: "304",
    新埔鎮: "305",
    關西鎮: "306",
    芎林鄉: "307",
    寶山鄉: "308",
    竹東鎮: "310",
    五峰鄉: "311",
    橫山鄉: "312",
    尖石鄉: "313",
    北埔鄉: "314",
    峨眉鄉: "315",

    // 苗栗縣
    竹南鎮: "350",
    頭份市: "351",
    三灣鄉: "352",
    南庄鄉: "353",
    獅潭鄉: "354",
    後龍鎮: "356",
    通霄鎮: "357",
    苑裡鎮: "358",
    苗栗市: "360",
    造橋鄉: "361",
    頭屋鄉: "362",
    公館鄉: "363",
    大湖鄉: "364",
    泰安鄉: "365",
    銅鑼鄉: "366",
    三義鄉: "367",
    西湖鄉: "368",
    卓蘭鎮: "369",

    // 彰化縣
    彰化市: "500",
    芬園鄉: "502",
    花壇鄉: "503",
    秀水鄉: "504",
    鹿港鎮: "505",
    福興鄉: "506",
    線西鄉: "507",
    和美鎮: "508",
    伸港鄉: "509",
    員林市: "510",
    社頭鄉: "511",
    永靖鄉: "512",
    埔心鄉: "513",
    溪湖鎮: "514",
    大村鄉: "515",
    埔鹽鄉: "516",
    田中鎮: "520",
    北斗鎮: "521",
    田尾鄉: "522",
    埤頭鄉: "523",
    溪州鄉: "524",
    竹塘鄉: "525",
    二林鎮: "526",
    大城鄉: "527",
    芳苑鄉: "528",
    二水鄉: "530",

    // 南投縣
    南投市: "540",
    中寮鄉: "541",
    草屯鎮: "542",
    國姓鄉: "544",
    埔里鎮: "545",
    仁愛鄉: "546",
    名間鄉: "551",
    集集鎮: "552",
    水里鄉: "553",
    魚池鄉: "555",
    信義鄉: "556",
    竹山鎮: "557",
    鹿谷鄉: "558",

    // 雲林縣
    斗南鎮: "630",
    大埤鄉: "631",
    虎尾鎮: "632",
    土庫鎮: "633",
    褒忠鄉: "634",
    東勢鄉: "635",
    台西鄉: "636",
    崙背鄉: "637",
    麥寮鄉: "638",
    斗六市: "640",
    林內鄉: "643",
    古坑鄉: "646",
    莿桐鄉: "647",
    西螺鎮: "648",
    二崙鄉: "649",
    北港鎮: "651",
    水林鄉: "652",
    口湖鄉: "653",
    四湖鄉: "654",
    元長鄉: "655",

    // 嘉義縣
    番路鄉: "602",
    梅山鄉: "603",
    竹崎鄉: "604",
    阿里山鄉: "605",
    中埔鄉: "606",
    大埔鄉: "607",
    水上鄉: "608",
    鹿草鄉: "611",
    太保市: "612",
    朴子市: "613",
    東石鄉: "614",
    六腳鄉: "615",
    新港鄉: "616",
    民雄鄉: "621",
    大林鎮: "622",
    溪口鄉: "623",
    義竹鄉: "624",
    布袋鎮: "625",

    // 屏東縣
    屏東市: "900",
    三地門鄉: "901",
    霧台鄉: "902",
    瑪家鄉: "903",
    九如鄉: "904",
    里港鄉: "905",
    高樹鄉: "906",
    鹽埔鄉: "907",
    長治鄉: "908",
    麟洛鄉: "909",
    竹田鄉: "911",
    內埔鄉: "912",
    萬丹鄉: "913",
    潮州鎮: "920",
    泰武鄉: "921",
    來義鄉: "922",
    萬巒鄉: "923",
    崁頂鄉: "924",
    新埤鄉: "925",
    南州鄉: "926",
    林邊鄉: "927",
    東港鎮: "928",
    琉球鄉: "929",
    佳冬鄉: "931",
    新園鄉: "932",
    枋寮鄉: "940",
    枋山鄉: "941",
    春日鄉: "942",
    獅子鄉: "943",
    車城鄉: "944",
    牡丹鄉: "945",
    恆春鎮: "946",
    滿州鄉: "947",

    // 台東縣
    台東市: "950",
    綠島鄉: "951",
    蘭嶼鄉: "952",
    延平鄉: "953",
    卑南鄉: "954",
    鹿野鄉: "955",
    關山鎮: "956",
    海端鄉: "957",
    池上鄉: "958",
    東河鄉: "959",
    成功鎮: "961",
    長濱鄉: "962",
    太麻里鄉: "963",
    金峰鄉: "964",
    大武鄉: "965",
    達仁鄉: "966",

    // 花蓮縣
    花蓮市: "970",
    新城鄉: "971",
    秀林鄉: "972",
    吉安鄉: "973",
    壽豐鄉: "974",
    鳳林鎮: "975",
    光復鄉: "976",
    豐濱鄉: "977",
    瑞穗鄉: "978",
    萬榮鄉: "979",
    玉里鎮: "981",
    卓溪鄉: "982",
    富里鄉: "983",

    // 澎湖縣
    馬公市: "880",
    西嶼鄉: "881",
    望安鄉: "882",
    七美鄉: "883",
    白沙鄉: "884",
    湖西鄉: "885",

    // 金門縣
    金沙鎮: "890",
    金湖鎮: "891",
    金寧鄉: "892",
    金城鎮: "893",
    烈嶼鄉: "894",
    烏坵鄉: "896",

    // 連江縣
    南竿鄉: "209",
    北竿鄉: "210",
    莒光鄉: "211",
    東引鄉: "212",
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleConfirm() {
    // 檢查必填欄位
    const required = [
      "receiverName",
      "receiverPhone",
      "receiverEmail",
      "buyerName",
      "buyerPhone",
      "buyerEmail",
      "shippingType",
      "invoiceType",
    ];
    // 宅配到府時需檢查地址與配送時間
    if (form.shippingType === "宅配到府") {
      required.push("receiverAddress", "deliveryTime");
    }
    for (const key of required) {
      if (!form[key] || form[key].trim() === "") {
        alert("請完整填寫所有資料！");
        return;
      }
    }
    if (
      form.shippingType === "超商取貨" &&
      (!form.storeName?.trim() || !form.storeAddress?.trim())
    ) {
      alert("請填寫門市名稱與地址！");
      return;
    }
    if (!validateForm(form, mobileCarrier)) {
      return; // 格式不符，阻止送出
    }

    localStorage.setItem("checkoutForm", JSON.stringify(form));
    window.location.href = "/cart/confirm";
  }

  // 推薦商品假資料
  const recommend = Array(6).fill({
    img: "https://picsum.photos/id/1058/600/400",
    title: "A4tech 雙飛燕 Bloody S98",
    price: "$2390",
  });
  useEffect(() => {
    if (syncMember && form) {
      setForm((f) => ({
        ...f,
        buyerName: f.receiverName,
        buyerPhone: f.receiverPhone,
        buyerEmail: f.receiverEmail,
      }));
    }
  }, [syncMember]); // 固定長度 = 1

  useEffect(() => {
    fetch("/api/cart/cvs/store")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStoreInfo({ name: data.CVSStoreName, address: data.CVSAddress });
          setForm((f) => ({
            ...f,
            storeName: data.CVSStoreName,
            storeAddress: data.CVSAddress,
          }));
        }
      });
  }, []);

  useEffect(() => {
    if (store711.storename) {
      setForm((f) => ({
        ...f,
        storeName: store711.storename,
        storeAddress: store711.storeaddress,
      }));
    }
  }, [store711]);

  if (!form) {
    return null;
  }

  return (
    <>
      <Header />

      <main>
        <div className="cart-header-steps">
          <div className="cartIcon">
            <button
              className="back-mobile"
              onClick={() => window.history.back()}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <i className="fas fa-shopping-cart"></i> 購物車
          </div>
          <CartSteps active={1} />
          <button className="backtomain" onClick={() => window.history.back()}>
            <i
              className="fa-solid fa-turn-down"
              style={{ transform: "rotate(90deg)" }}
            ></i>
            回上頁
          </button>
        </div>
        <div className="container checkout-page">
          <section className="checkout">
            {/* 配送方式 */}
            <div className="panel">
              <h3 className="panel-title">選擇配送方式</h3>
              <div className="panel-body">
                <div className="radio-group mb-md-3 mb-0">
                  <label className="radio">
                    <input
                      type="radio"
                      name="shippingType"
                      value="超商取貨"
                      checked={form.shippingType === "超商取貨"}
                      onChange={handleChange}
                    />
                    <span></span>
                    7-11取貨
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="shippingType"
                      value="宅配到府"
                      checked={form.shippingType === "宅配到府"}
                      onChange={handleChange}
                    />
                    <span></span>
                    宅配到府
                  </label>
                </div>
                {/* 門市資訊（僅 7-11 取貨時顯示） */}
                {form.shippingType === "超商取貨" && (
                  <>
                    <div className="row mb-md-3 mb-0">
                      <label className="d-flex align-items-center">
                        取貨門市
                        <button
                          className="checkout-btn checkout-btn-light"
                          type="button"
                          onClick={openWindow}
                        >
                          依地圖選擇
                        </button>
                      </label>
                    </div>
                    <div className="row">
                      <div className="store-info-text">
                        {store711.storename && (
                          <>
                            <p className="mb-0">門市名稱：{store711.storename}</p>
                            <p className="mb-0">門市地址：{store711.storeaddress}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* 收件人資訊 */}
            <div className="panel">
              <h3 className="panel-title">收件人資訊</h3>
              <div className="panel-body">
                <div className="form-row">
                  <label>收件人</label>
                  <input
                    type="text"
                    name="receiverName"
                    className="input-name"
                    placeholder="請輸入真實中文姓名"
                    value={form.receiverName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>手機號碼</label>
                  <input
                    type="text"
                    name="receiverPhone"
                    className="input-phone"
                    placeholder="請輸入手機號碼"
                    value={form.receiverPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    name="receiverEmail"
                    className="email-input"
                    placeholder="name@example.com"
                    value={form.receiverEmail}
                    onChange={handleChange}
                  />
                </div>
                {/* 宅配到府時顯示收件地址與配送時間 */}
                {form.shippingType === "宅配到府" && (
                  <>
                    <div className="form-row">
                      <label>收件地址</label>
                      <select
                        name="receiverCity"
                        value={form.receiverCity}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            receiverCity: e.target.value,
                            receiverDistrict: "",
                            receiverZip: "",
                          }));
                        }}
                        style={{ maxWidth: 120, marginRight: 8 }}
                      >
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <select
                        name="receiverDistrict"
                        value={form.receiverDistrict}
                        onChange={(e) => {
                          setForm((f) => ({
                            ...f,
                            receiverDistrict: e.target.value,
                            receiverZip: zips[e.target.value] || "",
                          }));
                        }}
                        style={{ maxWidth: 120, marginRight: 8 }}
                        disabled={
                          !form.receiverCity ||
                          form.receiverCity === "請選擇縣市"
                        }
                      >
                        {(
                          districts[form.receiverCity] || ["請選擇鄉鎮市區"]
                        ).map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="receiverZip"
                        className="zip-input"
                        value={form.receiverZip}
                        placeholder="郵遞區號"
                        readOnly
                      />
                    </div>
                    <div className="form-row">
                      <label></label>
                      <input
                        type="text"
                        name="receiverAddress"
                        className="input-address"
                        placeholder="請輸入詳細地址"
                        value={form.receiverAddress}
                        onChange={handleChange}
                        style={{ maxWidth: 400 }}
                      />
                    </div>
                    <div className="form-row">
                      <label>配送時間</label>
                      <select
                        name="deliveryTime"
                        value={form.deliveryTime}
                        onChange={handleChange}
                      >
                        <option value="">不限時</option>
                        <option value="上午">上午</option>
                        <option value="下午">下午</option>
                        <option value="晚上">晚上</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="checkbox-row">
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={syncMember}
                      onChange={(e) => setSyncMember(e.target.checked)}
                    />
                    同步收件人資訊到購買人資訊
                  </label>
                </div>
              </div>
            </div>
            {/* 付款方式 */}
            <div className="panel">
              <h3 className="panel-title">選擇付款方式</h3>
              <div className="panel-body">
                <div className="radio-group">
                  <label className="radio">
                    <input
                      type="radio"
                      name="payType"
                      value="取貨付款"
                      checked={form.payType === "取貨付款"}
                      onChange={handleChange}
                    />
                    <span></span>
                    超商取貨付款
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="payType"
                      value="ECPay付款"
                      checked={form.payType === "ECPay付款"}
                      onChange={handleChange}
                    />
                    <span></span>
                    ECPay付款
                  </label>
                </div>
              </div>
            </div>
            {/* 購買人資訊 */}
            <div className="panel">
              <h3 className="panel-title">購買人資訊</h3>
              <div className="panel-body">
                <div className="form-row">
                  <label>姓名</label>
                  <input
                    type="text"
                    name="buyerName"
                    className="input-name"
                    placeholder="請輸入真實中文姓名"
                    value={form.buyerName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>手機號碼</label>
                  <input
                    type="text"
                    name="buyerPhone"
                    className="input-phone"
                    placeholder="請輸入手機號碼"
                    value={form.buyerPhone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    name="buyerEmail"
                    className="email-input"
                    placeholder="name@example.com"
                    value={form.buyerEmail}
                    onChange={handleChange}
                  />
                </div>
                <div className="radio-group ">
                  <span className="bill">發票類型</span>
                  <div className="radio-group flex-column flex-md-row receipt">
                    <label className="radio">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="手機載具"
                        checked={form.invoiceType === "手機載具"}
                        onChange={handleChange}
                      />
                      <span></span>
                      手機載具
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="會員載具"
                        checked={form.invoiceType === "會員載具"}
                        onChange={handleChange}
                      />
                      <span></span>
                      會員載具
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="invoiceType"
                        value="捐贈發票"
                        checked={form.invoiceType === "捐贈發票"}
                        onChange={handleChange}
                      />
                      <span></span>
                      捐贈發票
                    </label>
                  </div>
                </div>
                {/* 手機載具輸入欄位，僅選擇手機載具時顯示 */}
                {form.invoiceType === "手機載具" && (
                  <div className="form-row input-carrier-row">
                    <input
                      type="text"
                      name="mobileCarrier"
                      className="input-carrier"
                      placeholder="請輸入手機條碼載具 (限大寫英數字) ex: /AB12345"
                      value={mobileCarrier}
                      onChange={(e) => setMobileCarrier(e.target.value)}
                      maxLength={8}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* 底部操作 */}
            <div className="actions">
              <button
                className="checkout-btn-step checkout-btn-secondary"
                type="button"
                onClick={() => (window.location.href = "/cart")}
              >
                回到購物車
              </button>
              <button
                className="checkout-btn-step checkout-btn-primary"
                type="button"
                onClick={handleConfirm}
              >
                確認訂單
              </button>
            </div>
          </section>
          {/* 推薦商品區塊 */}
          <RecommendList recommend={recommend} />
        </div>
      </main>

      <Footer />
    </>
  );
}
