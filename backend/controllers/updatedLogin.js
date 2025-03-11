// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
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
    
    // Validate password
    let isPasswordValid = false;
    
    // First check direct match (for plaintext passwords)
    if (password === user.user_password) {
      console.log('Direct password match!');
      isPasswordValid = true;
    } else {
      // Try bcrypt compare (for hashed passwords)
      try {
        isPasswordValid = await bcrypt.compare(password, user.user_password);
      } catch (err) {
        console.error('Bcrypt comparison error:', err);
        // If all else fails, just do a direct comparison again
        isPasswordValid = (password === user.user_password);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Password validation successful!');
    
    // Check if user is approved (except for headman who is automatically approved)
    if (user.status !== 'headman' && user.is_approved === 0) {
      return res.status(403).json({ 
        message: 'Your account is pending approval. Please contact the village headman.',
        isPending: true
      });
    }
    
    // Ensure user status is set
    let userStatus = user.status || 'villager';
    
    // Special case for user IDs 18 and 20 - ensure they have headman status
    if ((user.user_id === 18 || user.user_id === 20) && (!userStatus || userStatus === '')) {
      userStatus = 'headman';
      console.log(`Setting user ${user.user_id} status to headman in login function`);
      
      // Update the user's status in the database
      try {
        await db.query(
          'UPDATE users SET status = ? WHERE user_id = ?',
          ['headman', user.user_id]
        );
        console.log(`Updated user ${user.user_id} status to headman in database`);
      } catch (dbError) {
        console.error('Error updating user status:', dbError);
      }
    }
    
    // Generate JWT token with user status
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.user_email,
        status: userStatus  // Include user status in the token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Generated token with status:', userStatus);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.user_id,
      userStatus: userStatus  // Return user status to the client
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};