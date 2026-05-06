const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Barcha maydonlarni to\'ldiring' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'Email yoki username band' });

    const user = await User.create({ username, email, password, fullName });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Email yoki parol noto\'g\'ri' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'Akkaunt bloklangan' });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};