const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'mooban.system@gmail.com',
    pass: process.env.EMAIL_PASS || 'xvog bnvl rvxs rvxs'
  },
  debug: true, // Show debug output
  logger: true // Log information about the mail
});

/**
 * Send OTP code to user's email
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<boolean>} - True if email was sent successfully, false otherwise
 */
function sendOTP(email, otp) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: `"Mooban System" <${process.env.EMAIL_USER || 'mooban.system@gmail.com'}>`,
      to: email,
      subject: 'รหัสยืนยันสำหรับรีเซ็ตรหัสผ่าน',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
          <p style="font-size: 16px; line-height: 1.5;">เรียนผู้ใช้งาน,</p>
          <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
          <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h2>
          </div>
          <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
          <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
          <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending OTP:', error);
        resolve(false);
      } else {
        console.log('OTP sent:', info.response);
        resolve(true);
      }
    });
  });
}

module.exports = { sendOTP };const nodemailer = require('nodemailer');
