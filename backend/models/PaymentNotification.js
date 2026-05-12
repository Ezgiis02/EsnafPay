const mongoose = require('mongoose');

const paymentNotificationSchema = new mongoose.Schema({
  customerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  debtId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Debt' },
  esnafId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  musteriUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:        { type: Number, required: true },
  message:       { type: String, default: '' },
  status:        { type: String, enum: ['bekliyor', 'onaylandi', 'reddedildi'], default: 'bekliyor' },
}, { timestamps: true });

module.exports = mongoose.model('PaymentNotification', paymentNotificationSchema);
