const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  esnafId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Müşteri adı zorunludur'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  totalDebt: {
    type: Number,
    default: 0,
  },
  lastTransactionDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
