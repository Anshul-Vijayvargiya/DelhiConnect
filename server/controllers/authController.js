const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  const { name, phone, email, password, role, district, department } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const user = await User.create({
    name, phone, email,
    passwordHash: password,
    role: role || 'citizen',
    district, department
  });

  const token = signToken(user._id);
  res.status(201).json({ token, user: { _id: user._id, name, email, phone, role: user.role, district, department } });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, phone, password } = req.body;

  const user = await User.findOne(email ? { email } : { phone });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user._id);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, district: user.district, department: user.department } });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe };
