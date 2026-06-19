require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ─── MIDDLEWARE ───────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ───────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

// Twilio notification route
app.post('/api/notify/sms', async (req, res) => {
  const { phone, message } = req.body;
  const { sendWhatsApp } = require('./services/twilioService');
  const result = await sendWhatsApp(phone, message);
  res.json(result);
});

// Health check
app.get('/api/health', (req, res) => res.json({
  status: 'ok', time: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// ─── DB & START ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delhiconnect')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
