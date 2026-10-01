const express = require('express');
const Parser = require('rss-parser');
const prisma = require('../db');

const router = express.Router();
const parser = new Parser({ timeout: 7000 });

// GET /api/v1/sources
router.get('/', async (req, res) => {
  try {
    const sources = await prisma.source.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      },
      orderBy: { credibilityScore: 'desc' }
    });

    const formatted = sources.map(s => ({
      ...s,
      articleCount: s._count.articles
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/sources/test (Test feed URL validity)
router.post('/test', async (req, res) => {
  try {
    const { feedUrl } = req.body;
    if (!feedUrl) return res.status(400).json({ error: 'Feed URL is required' });

    const feed = await parser.parseURL(feedUrl);
    res.json({
      success: true,
      title: feed.title,
      itemsCount: feed.items ? feed.items.length : 0,
      sampleTitle: feed.items && feed.items[0] ? feed.items[0].title : null
    });
  } catch (err) {
    res.status(400).json({ error: 'Failed to parse RSS feed: ' + err.message });
  }
});

// POST /api/v1/sources
router.post('/', async (req, res) => {
  try {
    const { name, url, feedUrl, credibilityScore = 85, categoryName = 'World' } = req.body;
    if (!name || !url || !feedUrl) {
      return res.status(400).json({ error: 'Name, URL, and Feed URL are required.' });
    }

    const source = await prisma.source.create({
      data: {
        name,
        url,
        feedUrl,
        credibilityScore: parseInt(credibilityScore, 10),
        categoryName
      }
    });

    res.status(201).json(source);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/sources/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { credibilityScore, isActive } = req.body;

    const data = {};
    if (credibilityScore !== undefined) data.credibilityScore = parseInt(credibilityScore, 10);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await prisma.source.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/sources/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.source.delete({ where: { id } });
    res.json({ success: true, message: 'Source deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
