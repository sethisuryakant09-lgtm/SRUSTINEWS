// Load .env for local dev — Vercel injects env vars automatically
if (process.env.VERCEL !== '1') {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
}
const express = require('express');
const cors = require('cors');
const articlesRouter = require('./routes/articles');
const categoriesRouter = require('./routes/categories');
const sourcesRouter = require('./routes/sources');
const crawlerRouter = require('./routes/crawler');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SRUSTI NEWS API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API Routes
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/sources', sourcesRouter);
app.use('/api/v1/crawler', crawlerRouter);
app.use('/api/v1/admin', adminRouter);



// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Only start the HTTP server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
  const cron = require('node-cron');
  const { runCrawler } = require('./services/crawlerService');

  // Scheduled Ingestion Job (Every 15 minutes — local dev only)
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Cron] Triggering 15-minute scheduled news ingestion crawler...');
    try {
      await runCrawler();
    } catch (e) {
      console.error('[Cron] Ingestion failure:', e.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`📰 SRUSTI NEWS API Server`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📡 Endpoints active at: http://localhost:${PORT}/api/v1`);
    console.log(`====================================================`);
  });
}

module.exports = app;
