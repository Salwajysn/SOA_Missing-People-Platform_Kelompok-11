const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// GET semua berita
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET berita berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news WHERE news_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching news by ID:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST berita baru (assume: hanya admin bisa posting)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, category, image_url, author } = req.body || {};
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    await db.query(
      'INSERT INTO news (title, description, category, image_url, author) VALUES (?, ?, ?, ?, ?)',
      [title, description, category, image_url, author]
    );

    res.status(201).json({ message: 'News created successfully' });
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT update berita
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, category, image_url, author } = req.body || {};
    
    const [result] = await db.query(
      'UPDATE news SET title = ?, description = ?, category = ?, image_url = ?, author = ?, updated_at = CURRENT_TIMESTAMP WHERE news_id = ?',
      [title, description, category, image_url, author, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News updated successfully' });
  } catch (err) {
    console.error('Error updating news:', err);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE berita
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM news WHERE news_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json({ message: 'News deleted successfully' });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

module.exports = router;
