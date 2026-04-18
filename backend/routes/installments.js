const express = require('express');
const router = express.Router();
const Installment = require('../models/Installment');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// Bir borcun taksit listesi
router.get('/debt/:debtId', auth, async (req, res) => {
  try {
    const installments = await Installment.find({ debtId: req.params.debtId })
      .sort({ installmentNumber: 1 });
    res.json(installments);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Taksiti ödendi olarak işaretle
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const inst = await Installment.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!inst) return res.status(404).json({ message: 'Taksit bulunamadı' });
    if (inst.status === 'odendi') return res.status(400).json({ message: 'Taksit zaten ödendi' });

    inst.status = 'odendi';
    inst.paidDate = new Date();
    await inst.save();

    // Müşterinin toplam borcundan düş
    await Customer.findByIdAndUpdate(inst.customerId, {
      $inc: { totalDebt: -inst.amount },
    });

    res.json(inst);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Taksiti geri al (ödenmedi)
router.put('/:id/unpay', auth, async (req, res) => {
  try {
    const inst = await Installment.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!inst) return res.status(404).json({ message: 'Taksit bulunamadı' });
    if (inst.status === 'bekliyor') return res.status(400).json({ message: 'Taksit zaten bekliyor' });

    inst.status = 'bekliyor';
    inst.paidDate = null;
    await inst.save();

    await Customer.findByIdAndUpdate(inst.customerId, {
      $inc: { totalDebt: inst.amount },
    });

    res.json(inst);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
