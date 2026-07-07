import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PLAIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const JWT_SECRET = process.env.JWT_SECRET || 'crm_jwt_fallback_secret_key_1298';

// Hash the admin password in memory on server boot to avoid storing plain text
const HASHED_PASSWORD = bcrypt.hashSync(PLAIN_PASSWORD, 10);

/**
 * Handle Admin Login
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  // Check username (case-insensitive) and verify password hash
  const usernameMatch = username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const passwordMatch = bcrypt.compareSync(password, HASHED_PASSWORD);

  if (usernameMatch && passwordMatch) {
    // Sign token for the session
    const token = jwt.sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '24h' });
    
    return res.json({
      success: true,
      username: ADMIN_USERNAME,
      token
    });
  }

  return res.status(401).json({ error: 'Invalid username or password.' });
};
