const express = require('express');
const router = express.Router();
const PaymentNotification = require('../models/PaymentNotification');
const Customer = require('../models/Customer');
const Debt = require('../models/Debt');
const Installment = require('../models/Installment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Müşteri: ödeme bildirimi gönder
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, debtId, esnafId, amount, message } = req.body;
    if (!customerId || !esnafId || !amount) {
      return res.status(400).json({ message: 'customerId, esnafId ve amount zorunludur' });
    }
    const notif = await PaymentNotification.create({
      customerId,
      debtId: debtId || null,
      esnafId,
      musteriUserId: req.user.userId,
      amount: Number(amount),
      message: message?.trim() || '',
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Esnaf: bekleyen bildirimleri listele
router.get('/pending', auth, async (req, res) => {
  try {
    const notifications = await PaymentNotification.find({
      esnafId: req.user.userId,
      status: 'bekliyor',
    }).sort({ createdAt: -1 });

    const result = await Promise.all(notifications.map(async (n) => {
      const customer = await Customer.findById(n.customerId);
      const debt = n.debtId ? await Debt.findById(n.debtId) : null;
      return { ...n.toObject(), customer, debt };
    }));

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Esnaf: bildirimi onayla → ilgili taksit/borç otomatik ödendi işaretle
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const notif = await PaymentNotification.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!notif) return res.status(404).json({ message: 'Bildirim bulunamadı' });

    notif.status = 'onaylandi';
    await notif.save();

    if (notif.debtId) {
      const debt = await Debt.findById(notif.debtId);
      if (debt) {
        if (debt.type === 'taksit') {
          // Taksitli borç: sıradaki ödenmemiş taksiti öde
          const nextInst = await Installment.findOne({
            debtId: debt._id,
            status: 'bekliyor',
          }).sort({ installmentNumber: 1 });

          if (nextInst) {
            nextInst.status = 'odendi';
            nextInst.paidDate = new Date();
            await nextInst.save();

            await Customer.findByIdAndUpdate(notif.customerId, {
              $inc: { totalDebt: -nextInst.amount },
            });

            // Tüm taksitler bitti mi? → borcu da ödendi yap
            const kalan = await Installment.countDocuments({
              debtId: debt._id,
              status: 'bekliyor',
            });
            if (kalan === 0) {
              await Debt.findByIdAndUpdate(debt._id, { status: 'odendi' });
            }
          }
        } else {
          // Tek seferlik borç: direkt ödendi
          await Debt.findByIdAndUpdate(notif.debtId, { status: 'odendi' });
          await Customer.findByIdAndUpdate(notif.customerId, {
            $inc: { totalDebt: -notif.amount },
          });
        }
      }
    }

    res.json(notif);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Esnaf: bildirimi reddet
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const notif = await PaymentNotification.findOne({ _id: req.params.id, esnafId: req.user.userId });
    if (!notif) return res.status(404).json({ message: 'Bildirim bulunamadı' });

    notif.status = 'reddedildi';
    await notif.save();

    res.json(notif);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
