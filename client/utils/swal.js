// SweetAlert2 彈窗的共用包裝函式（成功/錯誤/確認提示）
// src/utils/swal.js
"use client";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "../styles/swal.css";

// 檢查是否為手機裝置
const isMobile = () => {
  return window.innerWidth <= 768;
};

// 獲取響應式設置
const getResponsiveConfig = () => {
  const mobile = isMobile();
  return {
    width: mobile ? "85vw" : "32rem",
    padding: mobile ? "1rem" : "1.25rem",
    customClass: {
      popup: mobile ? "swal2-mobile" : "swal2-desktop",
      htmlContainer: mobile ? "swal2-html-mobile" : "swal2-html-desktop",
    },
  };
};

export const swalSuccess = async (title = "成功", text = "", opts = {}) => {
  return await Swal.fire({
    icon: "success",
    title,
    text,
    showConfirmButton: false,
    timer: 2000,
    ...getResponsiveConfig(),
    ...opts,
  });
};

export const swalError = async (title = "錯誤", text = "", opts = {}) => {
  return await Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "確定",
    confirmButtonColor: "var(--Danger500)",
    ...getResponsiveConfig(),
    ...opts,
  });
};

export const swalConfirm = async (title = "確認", text = "", opts = {}) => {
  return await Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    ...getResponsiveConfig(),
    ...opts,
  });
};

// 服務條款
export const swalTerms = async () => {
  const mobile = isMobile();
  return await Swal.fire({
    title: '<span style="color: var(--Secondary800);">服務條款</span>',
    html: `
        <div style="text-align: left; max-height: ${mobile ? '60vh' : '400px'}; overflow-y: auto; padding: ${mobile ? '10px' : '20px'}; font-size: ${mobile ? '12px' : '14px'}; line-height: 1.6;">
            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第一條 總則</h6>
            <p><strong>1.1</strong> 本服務條款適用於您使用本電競商品網站所提供的各項服務。</p>
            <p><strong>1.2</strong> 本網站由 [Thync] 營運。</p>
            <p><strong>1.3</strong> 當您註冊成為本網站會員或使用本網站服務時，即表示您已閱讀、瞭解並同意接受本條款之所有內容。</p>
            <p><strong>1.4</strong> 本網站保留隨時修改本條款的權利，修改後的條款將於網站公告後生效。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第二條 會員註冊與帳戶管理</h6>
            <p><strong>2.1 註冊資格</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>您必須年滿18歲或在父母/法定監護人同意下使用本服務</li>
                <li>提供真實、準確、完整的個人資料</li>
                <li>每人限註冊一個帳戶</li>
            </ul>
            <p><strong>2.2 帳戶安全</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>您有責任保管帳戶密碼，不得將帳戶借予他人使用</li>
                <li>如發現帳戶遭到盜用，應立即通知本網站</li>
                <li>所有透過您帳戶進行的活動，您均需負完全責任</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第三條 商品與服務</h6>
            <p><strong>3.1 商品範圍</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>電競周邊設備（滑鼠、鍵盤、耳機等）</li>
                <li>電腦硬體設備</li>
                <li>遊戲軟體與點數卡</li>
                <li>電競服飾與配件</li>
            </ul>
            <p><strong>3.2 商品資訊</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>本網站致力提供準確的商品資訊，但不保證絕對無誤</li>
                <li>商品圖片僅供參考，實際商品以收到為準</li>
                <li>價格如有異動，以下單時顯示價格為準</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第四條 訂單與付款</h6>
            <p><strong>4.1 付款方式</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>信用卡付款（VISA、MasterCard、JCB）</li>
                <li>銀行轉帳</li>
                <li>第三方支付平台</li>
                <li>貨到付款（部分地區適用）</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第五條 配送與物流</h6>
            <p><strong>5.1 配送時間</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>台灣本島：1-3個工作天</li>
                <li>離島地區：3-7個工作天</li>
                <li>海外配送：依各地區而定</li>
            </ul>
            <p><strong>5.2</strong> 台灣本島滿NT$1,000免運費，未滿免運門檻依商品重量與體積收取運費。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第六條 退換貨政策</h6>
            <p><strong>6.1 退貨條件</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>自收貨日起7天內可申請退貨</li>
                <li>商品必須保持原包裝完整</li>
                <li>不得有使用痕跡或損壞</li>
                <li>附上完整配件與贈品</li>
            </ul>
            <p><strong>6.2 不適用退貨商品</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>客製化商品</li>
                <li>已拆封的軟體商品</li>
                <li>個人衛生用品</li>
                <li>易腐壞商品</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第七條 會員權益與責任</h6>
            <p><strong>7.1 會員權益</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>享有會員專屬優惠</li>
                <li>累積購物點數</li>
                <li>優先獲得新品資訊</li>
                <li>專屬客服服務</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第八條 智慧財產權</h6>
            <p><strong>8.1</strong> 本網站所有內容，包括但不限於文字、圖片、商標、軟體等，均受智慧財產權法保護。</p>
            <p><strong>8.2</strong> 未經本網站書面同意，不得複製、散布、修改或商業使用網站內容。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第九條 責任限制</h6>
            <p><strong>9.1</strong> 本網站對於不可抗力因素導致的服務中斷、第三方支付平台問題、用戶操作錯誤等情況不承擔責任。</p>
            <p><strong>9.2</strong> 本網站的賠償責任以商品價格為上限。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第十條 適用法律與爭議處理</h6>
            <p><strong>10.1</strong> 本條款適用中華民國法律。</p>
            <p><strong>10.2</strong> 因本條款產生的爭議，雙方應先協商解決。協商不成時，同意以台灣台北地方法院為第一審管轄法院。</p>
        </div>
    `,
    icon: "info",
    iconColor: "var(--Secondary800)",
    confirmButtonText: "我同意",
    confirmButtonColor: "var(--Secondary800)",
    width: mobile ? "85vw" : "700px",
    padding: mobile ? "1rem" : "1.25rem",
    customClass: {
      popup: mobile ? "swal2-mobile-terms" : "swal2-desktop-terms",
      htmlContainer: mobile ? "swal2-html-mobile-terms" : "swal2-html-desktop-terms",
    },
  });
};

// 隱私政策
export const swalPrivacy = async () => {
  const mobile = isMobile();
  return await Swal.fire({
    title: '<span style="color: var(--Secondary800);">隱私政策</span>',
    html: `
        <div style="text-align: left; max-height: ${mobile ? '60vh' : '400px'}; overflow-y: auto; padding: ${mobile ? '10px' : '20px'}; font-size: ${mobile ? '12px' : '14px'}; line-height: 1.6;">
            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第一條 政策總則</h6>
            <p><strong>1.1</strong> 本隱私政策說明本電競商品網站如何收集、使用、處理及保護您的個人資料。</p>
            <p><strong>1.2</strong> 本網站由 Thync 營運，我們承諾遵守《個人資料保護法》及相關法規。</p>
            <p><strong>1.3</strong> 當您使用本網站服務時，即表示您已閱讀、瞭解並同意本政策的所有內容。</p>
            <p><strong>1.4</strong> 本政策可能會不定期更新，修改後將於網站公告。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第二條 個人資料收集</h6>
            <p><strong>2.1 必要資料</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>姓名、聯絡電話、電子郵件地址</li>
                <li>收件地址、帳單地址</li>
                <li>身分證字號或統一編號（開立發票需要）</li>
                <li>信用卡或其他付款資訊</li>
            </ul>
            <p><strong>2.2 選擇性資料</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>生日、性別、職業</li>
                <li>遊戲偏好、產品興趣</li>
                <li>社群媒體帳號連結</li>
            </ul>
            <p><strong>2.3 自動收集資料</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>IP 位址、瀏覽器類型、裝置資訊</li>
                <li>網站使用行為、頁面瀏覽記錄</li>
                <li>Cookies 及類似技術資料</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第三條 個人資料使用目的</h6>
            <p><strong>3.1 主要使用目的</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>處理訂單、配送與售後服務</li>
                <li>提供技術支援與客服協助</li>
                <li>維護會員帳戶與權益服務</li>
                <li>發送商品資訊與優惠通知</li>
                <li>分析網站使用情況並改善服務</li>
                <li>防範詐欺及維護安全</li>
            </ul>
            <p><strong>3.2 資料使用期間</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>會員資料：帳戶存續期間及法定保存期限</li>
                <li>交易記錄：依稅法規定保存5年</li>
                <li>行銷資料：取得同意後至撤回同意為止</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第四條 個人資料分享與揭露</h6>
            <p><strong>4.1</strong> 我們不會販售您的個人資料。</p>
            <p><strong>4.2 資料分享情況</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>物流配送公司（處理訂單配送）</li>
                <li>金流服務商（處理付款交易）</li>
                <li>雲端服務提供商（資料儲存）</li>
                <li>配合司法機關依法調查</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第五條 資料安全保護</h6>
            <p><strong>5.1 技術保護措施</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>使用 SSL 加密技術保護資料傳輸</li>
                <li>建立防火牆及入侵偵測系統</li>
                <li>定期進行資安漏洞檢測</li>
                <li>資料庫加密儲存</li>
            </ul>
            <p><strong>5.2 管理保護措施</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>限制員工存取權限</li>
                <li>定期進行資安教育訓練</li>
                <li>建立資料外洩應變機制</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第六條 Cookies 及追蹤技術</h6>
            <p><strong>6.1 Cookies 使用目的</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>記住您的偏好設定與登入狀態</li>
                <li>分析網站使用情況</li>
                <li>提供個人化內容與相關廣告</li>
            </ul>
            <p><strong>6.2</strong> 您可以透過瀏覽器設定管理 Cookies，但停用某些 Cookies 可能影響網站功能。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第七條 您的權利</h6>
            <p><strong>7.1 依據個人資料保護法，您享有以下權利</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>查詢我們持有的您的個人資料</li>
                <li>要求更正錯誤或過時的資料</li>
                <li>要求刪除您的個人資料</li>
                <li>要求停止處理您的個人資料</li>
                <li>要求以結構化格式提供您的資料</li>
            </ul>
            <p><strong>7.2</strong> 我們將在收到申請後15個工作天內回應。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第八條 行銷通訊</h6>
            <p><strong>8.1</strong> 註冊時可選擇是否接收行銷訊息，您可隨時取消訂閱。</p>
            <p><strong>8.2 退訂方式</strong></p>
            <ul style="margin-left: ${mobile ? '15px' : '20px'}; font-size: ${mobile ? '11px' : '14px'};">
                <li>點擊郵件中的取消訂閱連結</li>
                <li>會員中心修改通知設定</li>
                <li>聯繫客服申請退訂</li>
            </ul>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第九條 兒童隱私保護</h6>
            <p><strong>9.1</strong> 本網站服務主要針對18歲以上成年人。</p>
            <p><strong>9.2</strong> 我們不會故意收集未滿18歲兒童的個人資料。</p>
            <p><strong>9.3</strong> 如發現無意中收集了兒童資料，我們將立即刪除。</p>

            <h6 style="color: var(--Black); border-bottom: 2px solid #eee; padding-bottom: 5px; font-size: ${mobile ? '14px' : '16px'};">第十條 政策修改與聯絡我們</h6>
            <p><strong>10.1</strong> 我們可能會不定期修改本隱私政策，重大修改將以網站公告、電子郵件等方式通知。</p>
        </div>
    `,
    icon: "info",
    iconColor: "var(--Secondary800)",
    confirmButtonText: "我同意",
    confirmButtonColor: "var(--Secondary800)",
    width: mobile ? "85vw" : "700px",
    padding: mobile ? "1rem" : "1.25rem",
    customClass: {
      popup: mobile ? "swal2-mobile-privacy" : "swal2-desktop-privacy",
      htmlContainer: mobile ? "swal2-html-mobile-privacy" : "swal2-html-desktop-privacy",
    },
  });
};

// 同意條款提示
export const swalHint = async (missingAgreements = []) => {
  const mobile = isMobile();
  return await Swal.fire({
    title: '<span style="color: var(--Danger500);">請先同意條款</span>',
    html: `
      <div style="text-align: center; padding: ${mobile ? '8px' : '10px'}; font-size: ${mobile ? '14px' : '16px'}; line-height: 1.6;">
        <p style="margin-bottom: 15px;">請先閱讀並同意以下條款：</p>
        <ul style="list-style-position: inside; color: var(--Danger500); padding: 0; font-size: ${mobile ? '13px' : '16px'};">
          ${missingAgreements.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    `,
    icon: "warning",
    iconColor: "var(--Danger500)",
    confirmButtonText: "我知道了",
    confirmButtonColor: "var(--Danger500)",
    width: mobile ? "80vw" : "400px",
    padding: mobile ? "1rem" : "1.25rem",
    customClass: {
      popup: mobile ? "swal2-mobile-hint" : "swal2-desktop-hint",
      htmlContainer: mobile ? "swal2-html-mobile-hint" : "swal2-html-desktop-hint",
    },
  });
};