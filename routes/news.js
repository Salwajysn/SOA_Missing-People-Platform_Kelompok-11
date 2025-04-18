const express = require('express');
const router = express.Router();
const db = require('../db');
const { uploadNewsImage } = require('../middleware/upload'); // Pastikan middleware import sudah benar
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

// POST berita baru (hanya membutuhkan token login, tidak perlu admin)
router.post('/', verifyToken, uploadNewsImage.single('image'), async (req, res) => {
  console.log("Isi req.user =>", req.user); // Debugging
  console.log("File uploaded:", req.file); // Debugging
  
  const { title, description, category, author } = req.body;
  
  // Pastikan file gambar ada
  const image_url = req.file ? `/uploads/news-photos/${req.file.filename}` : null;
  console.log("Image URL:", image_url); // Debugging

  if (!title || !description || !category || !image_url || !author) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
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
  const { title, description, category, image_url, author } = req.body;
  
  if (!title || !description || !category || !image_url || !author) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
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
