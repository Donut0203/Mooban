const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Format should be "Bearer [token]"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Use a default secret if JWT_SECRET is not set
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user ID, email, and status to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userStatus = decoded.status || '';

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    return res.status(401).json({ message: 'Invalid token' });
  }
};
