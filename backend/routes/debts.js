const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const Customer = require('../models/Customer');
const Installment = require('../models/Installment');
const auth = require('../middleware/auth');

// Müşterinin borç geçmişi
router.get('/customer/:customerId', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.customerId, esnafId: req.user.userId });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const debts = await Debt.find({ customerId: req.params.customerId }).sort({ date: -1 });
    res.json(debts);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yeni borç ekle
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, amount, description, date, type, installmentCount, firstDueDate } = req.body;

    if (!customerId) return res.status(400).json({ message: 'Müşteri zorunludur' });
    if (!amount || isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ message: 'Geçerli bir tutar girin' });

    const customer = await Customer.findOne({ _id: customerId, esnafId: req.user.userId });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const debtType = type === 'taksit' ? 'taksit' : 'tek';
    const status = debtType === 'taksit' ? 'taksitli' : 'bekliyor';

    const count = debtType === 'taksit' ? Number(installmentCount) || 2 : 1;
    const firstPaymentDate = firstDueDate ? new Date(firstDueDate) : new Date(date || Date.now());

    const debt = await Debt.create({
      customerId,
      esnafId: req.user.userId,
      amount: Number(amount),
      description: description?.trim() || '',
      date: date ? new Date(date) : new Date(),
      type: debtType,
      installmentCount: count,
      status,
      firstDueDate: firstPaymentDate,
    });

    // Taksitli ise installment kayıtlarını otomatik oluştur
    if (debtType === 'taksit') {
      const perInstallment = Math.floor(Number(amount) / count);
      const remainder = Math.round((Number(amount) - perInstallment * count) * 100) / 100;
      const installments = [];
      for (let i = 0; i < count; i++) {
        const dueDate = new Date(firstPaymentDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          debtId: debt._id,
          customerId,
          esnafId: req.user.userId,
          installmentNumber: i + 1,
          amount: i === count - 1 ? perInstallment + remainder : perInstallment,
          dueDate,
          status: 'bekliyor',
        });
      }
      await Installment.insertMany(installments);
    }

    // Müşterinin toplam borcunu ve son işlem tarihini güncelle
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalDebt: Number(amount) },
      lastTransactionDate: new Date(),
    });

    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Borç güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, description, date, type, installmentCount } = req.body;
    const debt = await Debt.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!debt) return res.status(404).json({ message: 'Borç bulunamadı' });

    const oldAmount = debt.amount;
    const newAmount = amount ? Number(amount) : debt.amount;
    const diff = newAmount - oldAmount;

    const updated = await Debt.findByIdAndUpdate(
      req.params.id,
      {
        amount: newAmount,
        description: description?.trim() ?? debt.description,
        date: date ? new Date(date) : debt.date,
        type: type ?? debt.type,
        installmentCount: installmentCount ? Number(installmentCount) : debt.installmentCount,
        status: (type ?? debt.type) === 'taksit' ? 'taksitli' : debt.status,
      },
      { new: true }
    );

    if (diff !== 0) {
      await Customer.findByIdAndUpdate(debt.customerId, { $inc: { totalDebt: diff } });
    }

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Borç sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const debt = await Debt.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!debt) return res.status(404).json({ message: 'Borç bulunamadı' });

    // Sadece ödenmemiş borçların tutarını geri al
    if (debt.status !== 'odendi') {
      await Customer.findByIdAndUpdate(debt.customerId, {
        $inc: { totalDebt: -debt.amount },
      });
    }

    await Installment.deleteMany({ debtId: debt._id });
    await debt.deleteOne();
    res.json({ message: 'Borç silindi' });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
