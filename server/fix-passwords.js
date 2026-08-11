// 一次性修復腳本：把資料庫裡明碼儲存的會員密碼轉成 bcrypt 雜湊值
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

// 連線到你的資料庫
const connection = await mysql.createConnection({
  host: "localhost",     // 改成你的設定
  user: "admin",          // 改成你的設定
  password: "a12345",
  database: "restful"
});

async function fixPasswords() {
  try {
    // 取出所有使用者
    const [users] = await connection.execute("SELECT id, password FROM users");

    for (const user of users) {
      // 如果密碼長度小於 60，通常表示是明文
      if (user.password.length < 60) {
        console.log(`正在更新使用者 ID ${user.id} 的密碼…`);

        // 把明文轉成 bcrypt hash
        const hashed = await bcrypt.hash(user.password, 10);

        // 更新回資料庫
        await connection.execute(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashed, user.id]
        );
      }
    }

    console.log("✅ 所有密碼更新完成！");
    process.exit(0);
  } catch (err) {
    console.error("❌ 發生錯誤：", err);
    process.exit(1);
  }
}

fixPasswords();