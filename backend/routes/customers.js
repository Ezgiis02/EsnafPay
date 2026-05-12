const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const User = require('../models/User');
const Debt = require('../models/Debt');
const Installment = require('../models/Installment');
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
    const { name, phone, address, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Müşteri adı zorunludur' });

    const customer = await Customer.create({
      esnafId: req.user.userId,
      name: name.trim(),
      phone: phone?.trim() || '',
      address: address?.trim() || '',
      notes: notes?.trim() || '',
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşterinin kendi profili — telefon eşleşmesiyle bağlı esnaf+borç listesi
router.get('/my-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });

    // Bu müşterinin telefonu ile eşleşen tüm customer kayıtlarını bul
    const customerRecords = await Customer.find({ phone: user.phone });

    const result = await Promise.all(customerRecords.map(async (customer) => {
      const debts = await Debt.find({ customerId: customer._id }).sort({ date: -1 });
      const esnaf = await User.findById(customer.esnafId).select('name shopName phone');
      const nextInstallment = await Installment.findOne({
        customerId: customer._id,
        status: 'bekliyor',
        dueDate: { $gte: new Date() },
      }).sort({ dueDate: 1 });
      return { customer, esnaf, debts, nextInstallment: nextInstallment || null };
    }));

    res.json(result);
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

// Müşteri güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Müşteri adı zorunludur' });

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, esnafId: req.user.userId },
      { name: name.trim(), phone: phone?.trim() || '', address: address?.trim() || '', notes: notes?.trim() || '' },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Müşteri sil (borç ve taksitler de silinir)
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, esnafId: req.user.userId });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    // Bağlı borç ve taksitler temizlenir
    const debts = await Debt.find({ customerId: customer._id });
    const debtIds = debts.map(d => d._id);
    await Installment.deleteMany({ debtId: { $in: debtIds } });
    await Debt.deleteMany({ customerId: customer._id });

    res.json({ message: 'Müşteri silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
