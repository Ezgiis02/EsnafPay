const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/debts', require('./routes/debts'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EsnafPay API çalışıyor' });
});

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlandı:', process.env.MONGODB_URI))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} adresinde çalışıyor`);
});
