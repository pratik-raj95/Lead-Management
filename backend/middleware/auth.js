import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'crm_jwt_fallback_secret_key_1298';

/**
 * Authentication middleware to protect endpoints
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token should be in format "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    return res.status(403).json({ error: 'Invalid authentication token.' });
  }
};
