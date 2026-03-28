const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ad soyad zorunludur'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası zorunludur'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
  },
  role: {
    type: String,
    enum: ['esnaf', 'musteri'],
    required: [true, 'Hesap türü zorunludur'],
  },
  shopName: {
    type: String,
    trim: true,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
