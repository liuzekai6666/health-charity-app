const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

admin.initializeApp();

// 配置 Gmail 发件
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zekailiu24@gmail.com",   // 你的 Gmail
    pass: "unkpntgoajonwkwd",       // 16 位应用专用密码
  },
});

// 云函数：当 Firestore 中 formSubmissions 有新文档时触发
exports.sendEmailOnFormSubmit = functions.firestore
  .document("formSubmissions/{docId}")
  .onCreate((snap, context) => {
    const data = snap.data();  // 获取新提交的数据

    const mailOptions = {
      from: "zekailiu24@gmail.com",          // 发件人
      to: "zliu0307@student.monash.edu",     // 收件人
      subject: "新表单提交",
      text: `姓名: ${data.name}\n邮箱: ${data.email}\n内容: ${data.message}`,
    };

    return transporter.sendMail(mailOptions)
      .then(() => console.log("✅ 邮件发送成功"))
      .catch((error) => console.error("❌ 邮件发送失败:", error));
  });
