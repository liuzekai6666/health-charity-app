// src/services/email.js
import emailjs from "emailjs-com";

export async function sendEmail(name, email, message) {
  const templateParams = {
    name: name || email,
    time: new Date().toLocaleString(),
    message: message
  };

  try {
    await emailjs.send(
      "service_9pms3yk",   // ✅ 新的 Service ID
      "template_ej4zoct",  // Template ID
      templateParams,
      "1fWqmXTfthfeYR60G"  // Public Key
    );
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email send failed:", error);
    alert("Email send failed: " + error.text);
  }
}