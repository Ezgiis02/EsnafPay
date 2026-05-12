const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Customer = require('../models/Customer');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Konuşma listesi — tüm bağlantılar (mesaj olmasa da görünür)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    let conversations = [];

    if (user.role === 'esnaf') {
      const customers = await Customer.find({ esnafId: user._id });
      for (const customer of customers) {
        const lastMsg = await Message.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
        const musteriUser = lastMsg
          ? await User.findById(lastMsg.musteriUserId).select('name')
          : null;
        const unreadCount = await Message.countDocuments({
          customerId: customer._id,
          senderId: { $ne: user._id },
          readBy: { $nin: [user._id] },
        });
        conversations.push({
          esnafId: user._id,
          customerId: customer._id,
          musteriUserId: lastMsg?.musteriUserId || null,
          customerName: customer.name,
          musteriName: musteriUser?.name || customer.name,
          lastMessage: lastMsg?.text || null,
          lastTime: lastMsg?.createdAt || null,
          unreadCount,
        });
      }
      conversations.sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return 0;
        if (!a.lastTime) return 1;
        if (!b.lastTime) return -1;
        return new Date(b.lastTime) - new Date(a.lastTime);
      });
    } else {
      const customerRecords = await Customer.find({ phone: user.phone });
      for (const customer of customerRecords) {
        const esnaf = await User.findById(customer.esnafId).select('name shopName');
        const lastMsg = await Message.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({
          customerId: customer._id,
          senderId: { $ne: user._id },
          readBy: { $nin: [user._id] },
        });
        conversations.push({
          esnafId: customer.esnafId,
          customerId: customer._id,
          musteriUserId: user._id,
          esnafName: esnaf?.shopName || esnaf?.name || 'Esnaf',
          lastMessage: lastMsg?.text || null,
          lastTime: lastMsg?.createdAt || null,
          unreadCount,
        });
      }
      conversations.sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return 0;
        if (!a.lastTime) return 1;
        if (!b.lastTime) return -1;
        return new Date(b.lastTime) - new Date(a.lastTime);
      });
    }

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Toplam okunmamış mesaj sayısı
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Message.countDocuments({
      senderId: { $ne: userId },
      readBy: { $nin: [userId] },
    });
    res.json({ count });
  } catch {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Belirli konuşmanın mesajları — açılınca okundu işaretle
router.get('/conversation/:customerId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await Message.find({ customerId: req.params.customerId })
      .sort({ createdAt: 1 });

    // Karşı tarafın mesajlarını okundu işaretle
    await Message.updateMany(
      {
        customerId: req.params.customerId,
        senderId: { $ne: userId },
        readBy: { $nin: [userId] },
      },
      { $addToSet: { readBy: userId } }
    );

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
      readBy: [req.user.userId],
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
