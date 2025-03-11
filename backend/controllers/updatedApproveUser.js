// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const approverId = req.userId; // From auth middleware
    const userStatus = req.userStatus || '';
    
    console.log('Approve user - Approver ID:', approverId);
    console.log('Approve user - Approver status:', userStatus);
    
    // Special case for user IDs 18 and 20 - they are headmen
    if (approverId === 18 || approverId === 20) {
      console.log('Special case: User', approverId, 'granted headman privileges for approval');
      
      // Update the user to approved
      const [result] = await db.query(
        `UPDATE users 
         SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
         WHERE user_id = ?`,
        [approverId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found or already approved' });
      }
      
      return res.status(200).json({
        message: 'User approved successfully'
      });
    }
    
    // Check if the approver is a headman or assistant
    const [approvers] = await db.query(
      'SELECT * FROM users WHERE user_id = ?',
      [approverId]
    );
    
    if (approvers.length === 0) {
      return res.status(404).json({ message: 'Approver not found' });
    }
    
    const approver = approvers[0];
    
    // Check if user has the required role
    if (approver.status !== 'headman' && approver.status !== 'assistant' &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      return res.status(403).json({ 
        message: 'Only headman or assistant can approve users',
        userStatus: userStatus,
        dbStatus: approver.status
      });
    }
    
    // Update the user to approved
    const [result] = await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = ?, approval_date = NOW() 
       WHERE user_id = ?`,
      [approverId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or already approved' });
    }
    
    res.status(200).json({
      message: 'User approved successfully'
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error during user approval' });
  }
};