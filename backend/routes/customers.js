const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Esnafın müşteri listesi
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find({ esnafId: req.user.userId }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni müşteri ekle
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Müşteri adı zorunludur' });

    const customer = await Customer.create({
      esnafId: req.user.userId,
      name: name.trim(),
      phone: phone?.trim() || '',
      notes: notes?.trim() || '',
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri detayı
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, esnafId: req.user.userId });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
