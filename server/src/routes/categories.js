const express = require('express');
const slugify = require('slugify');
const prisma = require('../db');

const router = express.Router();

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      color: cat.color,
      articleCount: cat._count.articles
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/v1/categories
router.post('/', async (req, res) => {
  try {
    const { name, description, color = '#2563EB' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = slugify(name, { lower: true, strict: true });
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || `Dispatches and verified updates in ${name}.`,
        color
      }
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
