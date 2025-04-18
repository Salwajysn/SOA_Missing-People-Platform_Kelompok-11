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

// API COMPLEX
// GET berita terbaru (http://localhost:5000/news/latest?limit=5)
router.get('/latest', async (req, res) => {
  const { limit = 5 } = req.query;  // Default limit 5 berita

  try {
    const query = `SELECT * FROM news ORDER BY created_at DESC LIMIT ?`;
    const [results] = await db.execute(query, [limit]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(500).json({ error: 'Error fetching latest news' });
  }
});

// API COMPLEX
// GET berita berdasarkan kategori (http://localhost:5000/news/category/missing) 
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;  // Mengambil kategori dari parameter URL

  try {
    // Query untuk mengambil berita berdasarkan kategori
    const query = `SELECT * FROM news WHERE category = ?`;
    const [results] = await db.execute(query, [category]);

    // Jika tidak ada berita ditemukan, beri respons 404
    if (results.length === 0) {
      return res.status(404).json({ message: 'No news found for this category' });
    }

    // Jika ada berita, kirimkan hasilnya
    res.json(results);
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).json({ error: 'Error fetching news by category' });
  }
});

// API COMPLEX
// GET berita berdasarkan penulis (http://localhost:5000/news/author/:author)
router.get('/author/:author', async (req, res) => {
  const { author } = req.params;

  try {
    const query = `SELECT * FROM news WHERE author = ?`;
    const [results] = await db.execute(query, [author]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No news found for this author' });
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching news by author:', error);
    res.status(500).json({ error: 'Error fetching news by author' });
  }
});

// API COMPLEX
// GET jumlah total berita
router.get('/total', async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS total_news FROM news`;
    const [results] = await db.execute(query);

    res.json({ total_news: results[0].total_news });
  } catch (error) {
    console.error('Error fetching total news count:', error);
    res.status(500).json({ error: 'Error fetching total news count' });
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
