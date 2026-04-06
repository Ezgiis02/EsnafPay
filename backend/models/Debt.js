const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  esnafId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Tutar zorunludur'],
    min: [0.01, 'Tutar 0dan büyük olmalıdır'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['tek', 'taksit'],
    default: 'tek',
  },
  installmentCount: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['bekliyor', 'taksitli', 'odendi'],
    default: 'bekliyor',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Debt', debtSchema);
