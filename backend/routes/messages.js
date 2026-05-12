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
      // Esnaf: tüm müşterilerini getir, varsa son mesajı ekle
      const customers = await Customer.find({ esnafId: user._id });
      for (const customer of customers) {
        const lastMsg = await Message.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
        const musteriUser = lastMsg
          ? await User.findById(lastMsg.musteriUserId).select('name')
          : null;
        conversations.push({
          esnafId: user._id,
          customerId: customer._id,
          musteriUserId: lastMsg?.musteriUserId || null,
          customerName: customer.name,
          musteriName: musteriUser?.name || customer.name,
          lastMessage: lastMsg?.text || null,
          lastTime: lastMsg?.createdAt || null,
        });
      }
      // Son mesaja göre sırala (mesajsızlar sona)
      conversations.sort((a, b) => {
        if (!a.lastTime && !b.lastTime) return 0;
        if (!a.lastTime) return 1;
        if (!b.lastTime) return -1;
        return new Date(b.lastTime) - new Date(a.lastTime);
      });
    } else {
      // Müşteri: eşleştiği tüm esnafları getir (telefon numarasına göre)
      const customerRecords = await Customer.find({ phone: user.phone });
      for (const customer of customerRecords) {
        const esnaf = await User.findById(customer.esnafId).select('name shopName');
        const lastMsg = await Message.findOne({ customerId: customer._id }).sort({ createdAt: -1 });
        conversations.push({
          esnafId: customer.esnafId,
          customerId: customer._id,
          musteriUserId: user._id,
          esnafName: esnaf?.shopName || esnaf?.name || 'Esnaf',
          lastMessage: lastMsg?.text || null,
          lastTime: lastMsg?.createdAt || null,
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
