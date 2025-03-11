// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data from database
    const [users] = await db.query(
      `SELECT user_id, user_email, first_name, last_name, phone, address, status,
       is_approved, created_at, profile_picture
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Return user data
    res.status(200).json({
      user: {
        user_id: user.user_id,
        user_email: user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        status: user.status,
        is_approved: user.is_approved,
        created_at: user.created_at,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error during profile fetch' });
  }
};// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data from database
    const [users] = await db.query(
      `SELECT user_id, user_email, first_name, last_name, phone, address, status,
       is_approved, created_at, profile_picture
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Return user data
    res.status(200).json({
      user: {
        user_id: user.user_id,
        user_email: user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        status: user.status,
        is_approved: user.is_approved,
        created_at: user.created_at,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error during profile fetch' });
  }
};// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data from database
    const [users] = await db.query(
      `SELECT user_id, user_email, first_name, last_name, phone, address, status,
       is_approved, created_at, profile_picture
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Return user data
    res.status(200).json({
      user: {
        user_id: user.user_id,
        user_email: user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        status: user.status,
        is_approved: user.is_approved,
        created_at: user.created_at,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error during profile fetch' });
  }
};// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user data from database
    const [users] = await db.query(
      `SELECT user_id, user_email, first_name, last_name, phone, address, status,
       is_approved, created_at, profile_picture
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Return user data
    res.status(200).json({
      user: {
        user_id: user.user_id,
        user_email: user.user_email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        status: user.status,
        is_approved: user.is_approved,
        created_at: user.created_at,
        profile_picture: user.profile_picture
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error during profile fetch' });
  }
};