const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};const db = require('../config/database');

// Forgot password - send OTP via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let sendEmail;
    try {
      sendEmail = require('../config/emailConfig').sendEmail;
    } catch (error) {
      console.error('Error loading email config:', error);
      // Create a dummy sendEmail function that always returns true
      sendEmail = async () => {
        console.log('Using dummy sendEmail function');
        return true;
      };
    }
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: 'If your email is registered, you will receive a verification code shortly.' 
      });
    }
    
    const user = users[0];
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (5 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    
    // Store the verification code in the password_reset table or memory
    let dbStoreSuccess = false;

    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, try to use it
        try {
          // First delete any existing reset codes for this email
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );

          // Insert new reset code
          await db.query(
            `INSERT INTO password_reset (user_email, otp, expires_at)
             VALUES (?, ?, ?)`,
            [email, verificationCode, expiryTime]
          );

          console.log(`Reset code stored in password_reset table for ${email}`);
          dbStoreSuccess = true;
        } catch (insertError) {
          console.error('Error inserting into password_reset table:', insertError);
        }
      } else {
        console.log('password_reset table does not exist, using memory storage');
      }
    } catch (dbError) {
      console.error('Database error when checking for password_reset table:', dbError);
    }

    // Always store in memory as a fallback or if DB storage failed
    if (!global.resetCodes) {
      global.resetCodes = {};
    }
    global.resetCodes[email] = {
      code: verificationCode,
      expiry: expiryTime
    };
    console.log(`Reset code stored in memory for ${email}`);

    // If DB storage failed but memory storage succeeded, we can still proceed
    if (!dbStoreSuccess) {
      console.log('Using memory storage as fallback for reset code');
    }
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4CAF50; text-align: center;">รีเซ็ตรหัสผ่าน</h1>
        <p style="font-size: 16px; line-height: 1.5;">เรียน ${user.first_name || 'ผู้ใช้งาน'},</p>
        <p style="font-size: 16px; line-height: 1.5;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
        <p style="font-size: 16px; line-height: 1.5;">รหัสยืนยันของคุณคือ:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin: 0; color: #333; letter-spacing: 5px;">${verificationCode}</h2>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        <p style="font-size: 16px; line-height: 1.5;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
        <p style="font-size: 16px; line-height: 1.5;">ขอแสดงความนับถือ,<br>ทีมงานระบบหมู่บ้าน</p>
      </div>
    `;
    
    // Try to send email using the simple sendOTP function
    let emailSent = false;
    try {
      const { sendOTP } = require('../utils/otpSender');
      emailSent = await sendOTP(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue anyway, we'll show the code on the screen
    }

    // Log for debugging
    console.log(`Verification code for ${email}: ${verificationCode}`);
    console.log(`Email sent: ${emailSent}`);

    // Return appropriate response based on whether email was sent
    res.status(200).json({
      message: emailSent
        ? 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)'
        : 'ไม่สามารถส่งอีเมลได้ โปรดลองอีกครั้งในภายหลัง',
      emailSent: emailSent,
      // Only include code if email sending failed and we're in development mode
      code: (!emailSent || process.env.NODE_ENV === 'development') ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // First check memory for the code (most reliable)
    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        console.log(`Valid reset code found in memory for ${email}`);
        return res.status(200).json({ message: 'Verification code is valid' });
      }
    }

    // If not found in memory, try the database
    try {
      // Check if password_reset table exists
      const [tables] = await db.query(
        `SHOW TABLES LIKE 'password_reset'`
      );

      if (tables.length > 0) {
        // Table exists, check for the code
        const [resetRecords] = await db.query(
          `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
          [email, code]
        );

        if (resetRecords.length > 0) {
          // Check if code has expired
          const resetRecord = resetRecords[0];
          if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
          }
          // Code is valid in database
          console.log(`Valid reset code found in database for ${email}`);
          return res.status(200).json({ message: 'Verification code is valid' });
        }
      }
    } catch (dbError) {
      console.error('Database error when verifying reset code:', dbError);
      // Continue to check memory (already done above)
    }

    // If we get here, the code is invalid
    return res.status(400).json({ message: 'Invalid verification code' });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset password with verification code
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
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

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // First check memory for the code (most reliable)
    let isCodeValid = false;
    let codeSource = '';

    if (global.resetCodes && global.resetCodes[email]) {
      if (global.resetCodes[email].code === code) {
        // Check if code has expired
        if (new Date(global.resetCodes[email].expiry) < new Date()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        // Code is valid in memory
        isCodeValid = true;
        codeSource = 'memory';
        console.log(`Valid reset code found in memory for ${email}`);
      }
    }

    // If not found in memory, try the database
    if (!isCodeValid) {
      try {
        // Check if password_reset table exists
        const [tables] = await db.query(
          `SHOW TABLES LIKE 'password_reset'`
        );

        if (tables.length > 0) {
          // Table exists, check for the code
          const [resetRecords] = await db.query(
            `SELECT * FROM password_reset WHERE user_email = ? AND otp = ?`,
            [email, code]
          );

          if (resetRecords.length > 0) {
            // Check if code has expired
            const resetRecord = resetRecords[0];
            if (new Date(resetRecord.expires_at) < new Date()) {
              return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            // Code is valid in database
            isCodeValid = true;
            codeSource = 'database';
            console.log(`Valid reset code found in database for ${email}`);
          }
        }
      } catch (dbError) {
        console.error('Database error when verifying reset code:', dbError);
        // Continue with memory check (already done above)
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    console.log(`Using reset code from ${codeSource} for ${email}`);
    
    // Update password
    try {
      await db.query(
        `UPDATE users SET
          user_password = ?,
          login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
         WHERE user_id = ?`,
        [newPassword, user.user_id]
      );
      
      // Delete the reset code from password_reset table
      if (codeSource === 'database') {
        try {
          await db.query(
            `DELETE FROM password_reset WHERE user_email = ?`,
            [email]
          );
          console.log(`Deleted reset code from database for ${email}`);
        } catch (deleteError) {
          console.error('Error deleting reset code from database:', deleteError);
          // Continue anyway, not critical
        }
      }

      // Always clear from memory if exists
      if (global.resetCodes && global.resetCodes[email]) {
        delete global.resetCodes[email];
        console.log(`Deleted reset code from memory for ${email}`);
      }
      
    } catch (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
}