require('dotenv').config();

const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const helmet = require('helmet');
const pool = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const packageRoutes = require('./routes/packageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174'
)
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.get('/api/db-test', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;