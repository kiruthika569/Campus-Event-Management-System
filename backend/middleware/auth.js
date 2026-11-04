const jwt = require('jsonwebtoken');

// Verify JWT token from Authorization header
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired authentication token.' });
  }
};

// Role-based authorization middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have sufficient permissions to perform this action.`
      });
    }

    next();
  };
};

const requireAdmin = [verifyToken, requireRole('admin')];
const requireStudent = [verifyToken, requireRole('student')];
const requireAnyAuth = [verifyToken, requireRole('admin', 'student')];

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireStudent,
  requireAnyAuth
};
