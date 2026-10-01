const express = require('express');
const prisma = require('../db');
const { runCrawler } = require('../services/crawlerService');

const router = express.Router();

// POST /api/v1/crawler/run  — manual trigger from admin UI
router.post('/run', async (req, res) => {
  try {
    console.log('[API] Manual crawler run triggered');
    const result = await runCrawler();
    res.json({
      success: true,
      message: 'Ingestion pipeline execution completed.',
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/crawler/run-cron  — called by Vercel Cron (GET only)
router.get('/run-cron', async (req, res) => {
  // Optional: verify the request is from Vercel Cron
  const authHeader = req.headers['authorization'];
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    console.log('[Cron] Scheduled crawler run triggered by Vercel Cron');
    const result = await runCrawler();
    res.json({
      success: true,
      message: 'Scheduled ingestion pipeline completed.',
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/crawler/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.crawlerLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
