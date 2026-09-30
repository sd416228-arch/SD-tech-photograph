const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

async function login(req, res) {
  const { email, password } = req.body;
  const result = await pool.query('SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = createToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
  return res.json({ success: true, data: { user: publicUser(user), token } });
}

async function me(req, res) {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
  if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: publicUser(result.rows[0]) });
}

function logout(req, res) {
  res.clearCookie('token');
  return res.json({ success: true, data: { message: 'Logged out successfully' } });
}

module.exports = { login, me, logout };
