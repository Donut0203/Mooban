// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};// Get pending users count for notification
exports.getPendingUsersCount = async (req, res) => {
  try {
    // Get the user ID and status from the token
    const userId = req.userId;
    const userStatus = req.userStatus || '';

    console.log('User ID from token:', userId);
    console.log('User status from token:', userStatus);

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === 18 || userId === 20) {
      console.log('Special case: User', userId, 'granted headman privileges for pending count');

      // Count pending users
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
      );

      return res.status(200).json({ count: count[0].count });
    }

    // Regular database flow
    // Check if the user is a headman or assistant
    const [users] = await db.query(
      'SELECT status FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0 ||
        (users[0].status !== 'headman' && users[0].status !== 'assistant' &&
         userStatus !== 'headman' && userStatus !== 'assistant')) {
      return res.status(403).json({
        message: 'Unauthorized',
        userStatus: userStatus,
        dbStatus: users.length > 0 ? users[0].status : null
      });
    }

    // Count pending users
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE is_approved = FALSE OR is_approved = 0'
    );

    res.status(200).json({ count: count[0].count });

  } catch (error) {
    console.error('Get pending users count error:', error);
    res.status(500).json({ 
      message: 'Server error during get pending users count',
      error: error.message
    });
  }
};