const express = require('express');
const router = express.Router();
const Installment = require('../models/Installment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Yarın vadesi gelen taksitler (rol bazlı)
router.get('/due-tomorrow', auth, async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow); start.setHours(0, 0, 0, 0);
    const end = new Date(tomorrow); end.setHours(23, 59, 59, 999);

    const user = await User.findById(req.user.userId);
    let installments = [];

    if (user.role === 'esnaf') {
      // Esnafın müşterilerine ait yarınki taksitler
      const customers = await Customer.find({ esnafId: user._id });
      const customerIds = customers.map(c => c._id);
      const insts = await Installment.find({
        customerId: { $in: customerIds },
        dueDate: { $gte: start, $lte: end },
        status: 'bekliyor',
      });
      installments = await Promise.all(insts.map(async (inst) => {
        const customer = customers.find(c => String(c._id) === String(inst.customerId));
        return { ...inst.toObject(), customerName: customer?.name || 'Müşteri' };
      }));
    } else {
      // Müşterinin eşleştiği customer kayıtlarına ait yarınki taksitler
      const customerRecords = await Customer.find({ phone: user.phone });
      const customerIds = customerRecords.map(c => c._id);
      const insts = await Installment.find({
        customerId: { $in: customerIds },
        dueDate: { $gte: start, $lte: end },
        status: 'bekliyor',
      });
      installments = await Promise.all(insts.map(async (inst) => {
        const customer = customerRecords.find(c => String(c._id) === String(inst.customerId));
        const esnaf = customer ? await User.findById(customer.esnafId).select('name shopName') : null;
        return {
          ...inst.toObject(),
          esnafName: esnaf?.shopName || esnaf?.name || 'Esnaf',
        };
      }));
    }

    res.json(installments);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

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
