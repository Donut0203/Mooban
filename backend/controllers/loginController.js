const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Reset locked_until for all users where the lock has expired
    try {
      await db.query(
        'UPDATE users SET locked_until = NULL, login_attempts = 0 WHERE locked_until IS NOT NULL AND locked_until <= NOW()'
      );
      console.log('Reset expired locks');
    } catch (error) {
      console.error('Error resetting expired locks:', error);
    }

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE user_email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('Found user:', {
      id: user.user_id,
      email: user.user_email,
      passwordLength: user.user_password ? user.user_password.length : 0,
      status: user.status,
      isApproved: user.is_approved,
      loginAttempts: user.login_attempts,
      lockedUntil: user.locked_until
    });

    // Check if this is a pending account
    const isPendingAccount = (user.status === 'pending' || (user.status !== 'headman' && user.is_approved === 0));

    // Check if user is pending approval
    if (isPendingAccount) {
      return res.status(403).json({
        message: 'บัญชีของคุณกำลังรออนุมัติ กรุณาติดต่อผู้ใหญ่บ้าน',
        isPending: true
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.locked_until) - new Date()) / 1000); // seconds
      return res.status(403).json({
        message: `Your account is locked due to multiple failed login attempts. Please try again in ${remainingTime} seconds.`,
        isLocked: true,
        lockedUntil: user.locked_until
      });
    }

    // Direct password comparison
    const isPasswordValid = password === user.user_password;
    console.log('Direct password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password validation failed');

      // Increment login attempts
      const loginAttempts = (user.login_attempts || 0) + 1;
      console.log('Login attempts:', loginAttempts);

      // Lock account after 3 failed attempts
      let lockedUntil = null;
      if (loginAttempts >= 3) {
        // Lock for 10 seconds
        const lockDate = new Date();
        lockDate.setSeconds(lockDate.getSeconds() + 10);
        lockedUntil = lockDate;
        console.log('Account locked until:', lockedUntil);
      }

      // Update login attempts and lock status
      await db.query(
        'UPDATE users SET login_attempts = ?, locked_until = ? WHERE user_id = ?',
        [loginAttempts, lockedUntil, user.user_id]
      );

      if (lockedUntil) {
        return res.status(403).json({
          message: 'Your account has been locked due to multiple failed login attempts. Please try again in 10 seconds.',
          isLocked: true,
          lockedUntil
        });
      }

      return res.status(401).json({
        message: isPendingAccount ? 'บัญชีของคุณกำลังรออนุมัติ กรุณาติดต่อผู้ใหญ่บ้าน' : 'Invalid credentials',
        attemptsRemaining: isPendingAccount ? undefined : (3 - loginAttempts),
        isPending: isPendingAccount
      });
    }

    console.log('Password validation successful!');

    // Reset login attempts on successful login
    await db.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE user_id = ?',
      [user.user_id]
    );

    // Generate JWT token with user status
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.user_email,
        status: user.status  // Include user status in the token
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      email: user.user_email,
      firstName: user.first_name,
      lastName: user.last_name,
      status: user.status,
      userStatus: user.status,
      isApproved: user.is_approved === 1
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};