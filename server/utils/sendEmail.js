// Nodemailer 寄信共用函式（Gmail SMTP）
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    // 建立 Gmail transporter（推薦使用 service: 'gmail'）
    const transporter = nodemailer.createTransport({
      service: "gmail", // 自動設定 Gmail SMTP 參數
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD, // 應用程式密碼
      },
    });

    // 驗證 SMTP 連線
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // 設定郵件內容
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html:
        options.html ||
        `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">重設密碼請求</h2>
          <p>您好，</p>
          <p>我們收到您重設密碼的請求。請點擊下方按鈕來重設您的密碼：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${options.resetUrl || "#"}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              重設密碼
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            如果按鈕無法點擊，請複製以下連結：<br>
            <code style="background-color: #f4f4f4; padding: 5px;">
              ${options.resetUrl || ""}
            </code>
          </p>
          <p style="color: #666; font-size: 14px;">
            此連結將在 10 分鐘後過期。
          </p>
        </div>
      `,
    };

    // 發送郵件
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);

    // 提供更詳細的錯誤訊息
    let errorMessage = "郵件發送失敗";

    if (error.code === "EAUTH") {
      errorMessage = "Gmail 驗證失敗，請檢查應用程式密碼";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "無法連接到郵件伺服器";
    } else if (error.responseCode === 535) {
      errorMessage = "Gmail 帳號或密碼錯誤";
    }

    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

export default sendEmail;
