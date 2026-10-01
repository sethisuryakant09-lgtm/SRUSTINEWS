const express = require('express');
const prisma = require('../db');

const router = express.Router();

// GET /api/v1/articles/breaking
router.get('/breaking', async (req, res) => {
  try {
    const breaking = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isBreaking: true
      },
      include: {
        category: true,
        source: true
      },
      orderBy: { publishedAt: 'desc' },
      take: 6
    });

    // Fallback if no breaking news flagged
    if (breaking.length === 0) {
      const fallback = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        include: { category: true, source: true },
        orderBy: { publishedAt: 'desc' },
        take: 4
      });
      return res.json(fallback);
    }

    res.json(breaking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/articles/featured
router.get('/featured', async (req, res) => {
  try {
    const featured = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true
      },
      include: {
        category: true,
        source: true
      },
      orderBy: { publishedAt: 'desc' },
      take: 5
    });

    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/articles/trending
router.get('/trending', async (req, res) => {
  try {
    const trending = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, source: true },
      orderBy: { viewCount: 'desc' },
      take: 5
    });
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/articles
router.get('/', async (req, res) => {
  try {
    const { category, source, search, sort = 'latest', page = 1, limit = 12, maxReadTime } = req.query;

    const where = {
      status: 'PUBLISHED'
    };

    if (category && category !== 'all') {
      where.category = {
        slug: category
      };
    }

    if (source) {
      where.source = {
        name: source
      };
    }

    if (maxReadTime) {
      where.readTime = {
        lte: parseInt(maxReadTime, 10)
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy = { publishedAt: 'desc' };
    if (sort === 'trending' || sort === 'views') {
      orderBy = { viewCount: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { publishedAt: 'asc' };
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: true,
          source: true
        },
        orderBy,
        take,
        skip
      }),
      prisma.article.count({ where })
    ]);

    res.json({
      data: articles,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/articles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        source: true
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment viewCount
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    // Related articles
    const related = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId: article.categoryId,
        id: { not: article.id }
      },
      include: { category: true, source: true },
      take: 4,
      orderBy: { publishedAt: 'desc' }
    });

    res.json({
      ...article,
      viewCount: article.viewCount + 1,
      related
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/articles/:id/view
router.patch('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.article.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    res.json({ success: true, viewCount: updated.viewCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
