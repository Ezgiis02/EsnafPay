const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, shopName } = req.body;

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ message: 'Tüm alanlar zorunludur' });
    }

    if (role === 'esnaf' && !shopName?.trim()) {
      return res.status(400).json({ message: 'Dükkan adı zorunludur' });
    }

    if (!['esnaf', 'musteri'].includes(role)) {
      return res.status(400).json({ message: 'Geçersiz hesap türü' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu telefon numarası zaten kayıtlı' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, phone, password: hashedPassword, role, shopName: shopName?.trim() || '' });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, shopName: user.shopName },
    });
  } catch (err) {
    console.error('Register hatası:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Telefon ve şifre zorunludur' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Telefon veya şifre hatalı' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Telefon veya şifre hatalı' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, shopName: user.shopName },
    });
  } catch (err) {
    console.error('Login hatası:', err.message);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
