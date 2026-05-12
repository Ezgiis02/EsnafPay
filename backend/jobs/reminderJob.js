const cron = require('node-cron');
const Installment = require('../models/Installment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const sendPush = require('../utils/sendPush');

// Her gün saat 09:00'da çalışır
function startReminderJob() {
  cron.schedule('0 9 * * *', async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = new Date(tomorrow.setHours(0, 0, 0, 0));
      const end = new Date(tomorrow.setHours(23, 59, 59, 999));

      // Yarın vadesi gelen ödenmemiş taksitler
      const installments = await Installment.find({
        dueDate: { $gte: start, $lte: end },
        status: 'bekliyor',
      });

      for (const inst of installments) {
        const customer = await Customer.findById(inst.customerId);
        if (!customer) continue;

        // Esnafa bildirim
        const esnaf = await User.findById(customer.esnafId).select('expoPushToken name shopName');
        if (esnaf?.expoPushToken) {
          await sendPush(
            esnaf.expoPushToken,
            '📅 Taksit Hatırlatması',
            `${customer.name} müşterinizin ${inst.amount.toLocaleString('tr-TR')}₺ taksiti yarın vadesi doluyor.`
          );
        }

        // Müşteriye bildirim (telefon eşleşmesiyle)
        const musteriUser = await User.findOne({ phone: customer.phone, role: 'musteri' }).select('expoPushToken');
        if (musteriUser?.expoPushToken) {
          const esnafName = esnaf?.shopName || esnaf?.name || 'Esnafınız';
          await sendPush(
            musteriUser.expoPushToken,
            '📅 Taksit Hatırlatması',
            `${esnafName}'a olan ${inst.amount.toLocaleString('tr-TR')}₺ taksitinizin yarın vadesi doluyor.`
          );
        }
      }
    } catch (err) {
      console.error('Hatırlatma job hatası:', err.message);
    }
  }, { timezone: 'Europe/Istanbul' });

  console.log('Taksit hatırlatma job başlatıldı (her gün 09:00)');
}

module.exports = startReminderJob;
