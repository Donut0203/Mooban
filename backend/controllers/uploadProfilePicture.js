// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: paramUserId } = req.params;
    
    // Check if the user is updating their own profile picture
    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'You can only update your own profile picture' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path
    const profilePicturePath = req.file.path;
    
    // Update the user's profile picture in the database
    const [result] = await db.query(
      `UPDATE users SET
        profile_picture = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [profilePicturePath, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the profile picture URL
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: profilePicturePath
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
};// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: paramUserId } = req.params;
    
    // Check if the user is updating their own profile picture
    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'You can only update your own profile picture' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path
    const profilePicturePath = req.file.path;
    
    // Update the user's profile picture in the database
    const [result] = await db.query(
      `UPDATE users SET
        profile_picture = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [profilePicturePath, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the profile picture URL
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: profilePicturePath
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
};// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: paramUserId } = req.params;
    
    // Check if the user is updating their own profile picture
    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'You can only update your own profile picture' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path
    const profilePicturePath = req.file.path;
    
    // Update the user's profile picture in the database
    const [result] = await db.query(
      `UPDATE users SET
        profile_picture = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [profilePicturePath, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the profile picture URL
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: profilePicturePath
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
};// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: paramUserId } = req.params;
    
    // Check if the user is updating their own profile picture
    if (userId !== parseInt(paramUserId)) {
      return res.status(403).json({ message: 'You can only update your own profile picture' });
    }
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get the file path
    const profilePicturePath = req.file.path;
    
    // Update the user's profile picture in the database
    const [result] = await db.query(
      `UPDATE users SET
        profile_picture = ?,
        updated_at = NOW()
       WHERE user_id = ?`,
      [profilePicturePath, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the profile picture URL
    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePictureUrl: profilePicturePath
    });
    
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error during profile picture upload' });
  }
};