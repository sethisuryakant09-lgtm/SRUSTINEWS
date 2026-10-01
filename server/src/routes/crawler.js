const express = require('express');
const prisma = require('../db');
const { runCrawler } = require('../services/crawlerService');

const router = express.Router();

// POST /api/v1/crawler/run
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
