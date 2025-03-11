const db = require('../config/database');

// Simple reset password - no OTP required
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }
    
    // Validate password length (max 10 characters)
    if (newPassword.length > 10) {
      return res.status(400).json({
        message: 'Password must be 10 characters or less',
        error: 'PASSWORD_TOO_LONG'
      });
    }

    // Validate password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return res.status(400).json({
        message: 'Password must contain uppercase letters, lowercase letters, and numbers',
        error: 'PASSWORD_COMPLEXITY'
      });
    }
    
    // Check if user exists and has the required role
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(400).json({
        message: 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
      });
    }

    const user = users[0];

    // Check if user has the required role (headman or assistant)
    if (user.status !== 'headman' && user.status !== 'assistant') {
      return res.status(400).json({
        message: 'อีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
      });
    }
    
    // Update password
    await db.query(
      `UPDATE users SET
        user_password = ?,
        login_attempts = 0,
        locked_until = NULL,
        updated_at = NOW()
       WHERE user_id = ?`,
      [newPassword, user.user_id]
    );
    
    // Return success response
    res.status(200).json({ 
      message: 'รหัสผ่านของคุณได้ถูกรีเซ็ตเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};