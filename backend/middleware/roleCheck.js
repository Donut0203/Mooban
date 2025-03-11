/**
 * Middleware for role-based access control
 * This middleware checks if the user has the required role(s) to access a route
 */

// Middleware to check if user has one of the specified roles
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get user status from the request (set by auth middleware)
      const userStatus = req.userStatus;
      
      console.log('Role check - User status:', userStatus);
      console.log('Role check - Allowed roles:', allowedRoles);
      
      // If user status is not defined, check user ID for special cases
      if (!userStatus) {
        // Special case for user IDs 18 and 20 - they are headmen
        if (req.userId === 18 || req.userId === 20) {
          console.log(`Special case: User ${req.userId} granted headman privileges`);
          req.userStatus = 'headman';
          userStatus = 'headman';
        } else {
          return res.status(403).json({
            message: 'Access denied: User role not found in token',
            error: 'ROLE_NOT_FOUND',
            userId: req.userId
          });
        }
      }
      
      // Check if user has one of the allowed roles
      if (allowedRoles.includes(userStatus)) {
        // User has permission, proceed to the next middleware
        return next();
      }
      
      // User does not have permission
      return res.status(403).json({ 
        message: 'Access denied: Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: userStatus
      });
      
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        message: 'Server error during permission check',
        error: error.message
      });
    }
  };
};

// Define middleware for specific roles
const headmanOnly = hasRole(['headman']);
const headmanOrAssistant = hasRole(['headman', 'assistant']);

// Export the middleware functions
module.exports = {
  hasRole,
  headmanOnly,
  headmanOrAssistant
}