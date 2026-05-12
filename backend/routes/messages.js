const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Customer = require('../models/Customer');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Konuşma listesi — kullanıcıya göre
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let conversations = [];

    if (user.role === 'esnaf') {
      // Esnaf: mesaj gönderdiği/aldığı her müşteri için son mesajı getir
      const msgs = await Message.aggregate([
        { $match: { esnafId: user._id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$customerId', lastMsg: { $first: '$$ROOT' } } },
      ]);
      for (const m of msgs) {
        const customer = await Customer.findById(m._id);
        const musteriUser = await User.findById(m.lastMsg.musteriUserId).select('name');
        conversations.push({
          customerId: m._id,
          musteriUserId: m.lastMsg.musteriUserId,
          customerName: customer?.name || 'Müşteri',
          musteriName: musteriUser?.name || customer?.name || 'Müşteri',
          lastMessage: m.lastMsg.text,
          lastTime: m.lastMsg.createdAt,
        });
      }
    } else {
      // Müşteri: mesaj gönderdiği/aldığı her esnaf için son mesajı getir
      const msgs = await Message.aggregate([
        { $match: { musteriUserId: user._id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$esnafId', lastMsg: { $first: '$$ROOT' } } },
      ]);
      for (const m of msgs) {
        const esnaf = await User.findById(m._id).select('name shopName');
        const customer = await Customer.findById(m.lastMsg.customerId);
        conversations.push({
          esnafId: m._id,
          customerId: m.lastMsg.customerId,
          esnafName: esnaf?.shopName || esnaf?.name || 'Esnaf',
          lastMessage: m.lastMsg.text,
          lastTime: m.lastMsg.createdAt,
        });
      }
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Belirli konuşmanın mesajları
router.get('/conversation/:customerId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ customerId: req.params.customerId })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Mesaj gönder
router.post('/', auth, async (req, res) => {
  try {
    const { customerId, esnafId, musteriUserId, text } = req.body;
    if (!customerId || !esnafId || !musteriUserId || !text?.trim()) {
      return res.status(400).json({ message: 'Eksik alan' });
    }
    const msg = await Message.create({
      esnafId,
      musteriUserId,
      customerId,
      senderId: req.user.userId,
      text: text.trim(),
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Esnaf: müşteri kaydından müşteri kullanıcısını bul (chat başlatmak için)
router.get('/find-musteri/:customerId', auth, async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.customerId,
      esnafId: req.user.userId,
    });
    if (!customer) return res.status(404).json({ message: 'Müşteri bulunamadı' });

    const musteriUser = await User.findOne({ phone: customer.phone, role: 'musteri' }).select('_id name phone');
    res.json({ customer, musteriUser: musteriUser || null });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
