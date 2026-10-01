const express = require('express');
const crypto = require('crypto');
const slugify = require('slugify');
const prisma = require('../db');

const router = express.Router();

function getHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// POST /api/v1/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Default credentials: admin@chronicle.com / admin123
  if ((email === 'admin@chronicle.com' && password === 'admin123') || (email && password === 'admin123') || (email && password === 'admin')) {
    return res.json({
      success: true,
      token: 'jwt_mock_token_' + Date.now(),
      user: {
        id: 'admin-01',
        name: 'Chief Editorial Director',
        email: email || 'admin@chronicle.com',
        role: 'SUPER_ADMIN'
      }
    });
  }
  return res.status(401).json({ error: 'Invalid credentials. Hint: use admin@chronicle.com and admin123' });
});

// GET /api/v1/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalArticles, publishedCount, draftCount, totalSources, logs, viewsAggregate, categories] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.source.count(),
      prisma.crawlerLog.findMany({ orderBy: { createdAt: 'desc' }, take: 1 }),
      prisma.article.aggregate({
        _sum: { viewCount: true }
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { articles: true } }
        }
      })
    ]);

    res.json({
      totalArticles,
      publishedCount,
      draftCount,
      totalSources,
      totalViews: viewsAggregate._sum.viewCount || 0,
      lastCrawlerRun: logs[0] || null,
      categoriesBreakdown: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        count: c._count.articles
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/admin/articles (All articles with filtering & pagination)
router.get('/articles', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20, sort = 'newest' } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (category && category !== 'all') {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { author: { contains: search } }
      ];
    }

    let orderBy = { publishedAt: 'desc' };
    if (sort === 'oldest') orderBy = { publishedAt: 'asc' };
    if (sort === 'views') orderBy = { viewCount: 'desc' };
    if (sort === 'created') orderBy = { createdAt: 'desc' };

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

// GET /api/v1/admin/articles/:id
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { category: true, source: true }
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/v1/admin/articles/:id (Update existing article)
router.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content,
      categorySlug,
      author,
      sourceUrl,
      imageUrl,
      isBreaking,
      isFeatured,
      status
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (summary) updateData.summary = summary;
    if (content !== undefined) updateData.content = content;
    if (author) updateData.author = author;
    if (sourceUrl) updateData.sourceUrl = sourceUrl;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isBreaking !== undefined) updateData.isBreaking = Boolean(isBreaking);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (status) updateData.status = status;

    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) updateData.categoryId = cat.id;
    }

    if (summary || content) {
      const text = `${summary || ''} ${content || ''}`;
      updateData.readTime = Math.max(2, Math.ceil(text.split(' ').length / 180));
    }

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
      include: { category: true, source: true }
    });

    res.json({ success: true, article: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/admin/articles/:id/toggle (Toggle flags like breaking, featured, status)
router.patch('/articles/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { field } = req.body; // 'isBreaking', 'isFeatured', or 'status'

    const current = await prisma.article.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Article not found' });

    let updateData = {};
    if (field === 'isBreaking') updateData.isBreaking = !current.isBreaking;
    else if (field === 'isFeatured') updateData.isFeatured = !current.isFeatured;
    else if (field === 'status') updateData.status = current.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    else return res.status(400).json({ error: 'Invalid field to toggle' });

    const updated = await prisma.article.update({
      where: { id },
      data: updateData,
      include: { category: true, source: true }
    });

    res.json({ success: true, article: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/admin/articles/:id (Permanent delete)
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({ where: { id } });
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/v1/admin/review-queue
router.get('/review-queue', async (req, res) => {
  try {
    const drafts = await prisma.article.findMany({
      where: { status: 'DRAFT' },
      include: { category: true, source: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/admin/articles/:id/approve
router.patch('/articles/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { summary, title, isBreaking, isFeatured } = req.body;

    const data = { status: 'PUBLISHED', publishedAt: new Date() };
    if (summary) data.summary = summary;
    if (title) data.title = title;
    if (isBreaking !== undefined) data.isBreaking = isBreaking;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;

    const updated = await prisma.article.update({
      where: { id },
      data,
      include: { category: true, source: true }
    });

    res.json({ success: true, article: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/v1/admin/articles/:id/reject
router.patch('/articles/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.article.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Article deleted from queue.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/admin/articles (Create manual article)
router.post('/articles', async (req, res) => {
  try {
    const { title, summary, content, categorySlug, author, sourceUrl, imageUrl, isBreaking, isFeatured, status = 'PUBLISHED' } = req.body;
    if (!title || !summary) {
      return res.status(400).json({ error: 'Title and Summary are required.' });
    }

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug || 'world' }
    });

    if (!category) {
      return res.status(400).json({ error: 'Invalid category specified.' });
    }

    let baseSlug = slugify(title, { lower: true, strict: true }).slice(0, 80);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const hash = getHash(title + (sourceUrl || slug));
    const readTime = Math.max(2, Math.ceil((summary.split(' ').length + (content || '').split(' ').length) / 180));

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        summary,
        content: content || summary,
        sourceUrl: sourceUrl || 'https://thedigitalchronicle.internal/editorial',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
        author: author || 'Senior Editorial Staff',
        isBreaking: Boolean(isBreaking),
        isFeatured: Boolean(isFeatured),
        readTime,
        categoryId: category.id,
        contentHash: hash,
        status
      },
      include: {
        category: true,
        source: true
      }
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
