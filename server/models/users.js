// User 資料模型（早期練習用，目前主要邏輯已改寫在 routes/users.js 裡）
import connection from "../connect.js";
import mysql from "mysql2/promise";

class User {
  constructor(userData) {
    this.id = userData.id;
    this.mail = userData.mail;
    this.password = userData.password;
    this.account = userData.account;
  }

  // (靜態方法)根據 mail 查詢使用者
  static async findByEmail(mail) {
    // 解構賦值，取得查詢結果的第一個元素（資料陣列）
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM users WHERE mail = ? AND is_valid = 1",
        [mail]
      );

      if (rows.length > 0) {
        // 用查詢到的資料建立新的 User 物件
        return new User(rows[0]);
      }
      return null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }
}

export default User;
